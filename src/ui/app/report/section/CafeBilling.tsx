import { Coins, Search } from "lucide-react";
import DataTableCustom from "../../../components/datatable/DataTableCustom";
import { TableColumn } from "react-data-table-component";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import { cn, convertRupiah } from "../../../lib/utils";
import ReportTitle from "./ReportTitle";
import { OrderCafe } from "../../../../electron/types";
import moment from "moment-timezone";
import { useCallback, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { debounce } from "lodash";
import TopSaleCafe from "./components/TopSaleCafe";



const columns: TableColumn<OrderCafe>[] = [
    {
        name: "ID Order",
        selector: row => row.id_order_cafe,
        cell: row => <Chip color="success" size="sm" classNames={{
            content: "font-semibold"
        }}>{row.id_order_cafe}</Chip>
    },
    {
        name: "Nama Pelanggan",
        selector: row => row.name,
        sortable: true
    },
    {
        name: "Menu",
        selector: row => row.menucafe.name,
        sortable: true
    },
    {
        name: "Qty",
        selector: row => row.qty,
        sortable: true
    },
    {
        name: "Total",
        selector: row => convertRupiah(row.toString() || "0"),
        sortable: true
    },
    {
        name: "Shift",
        selector: row => row.shift,
        sortable: true,
        cell: row => <Chip size="sm" className={cn("capitalize", row.shift === "pagi" ? "bg-yellow-600" : "bg-slate-500")}>{row.shift}</Chip>
    },
    {
        name: "Tanggal",
        selector: row => moment(row.created_at).format("DD/MM/YYYY HH:mm"),
        sortable: true
    }
]

interface CafeReportType {
    order_cafe: OrderCafe[],
    total_all: number,
    period: string
}

function CafeTable({ cafe, searchTerm, setSearchTerm, loading, filteredCafe }: { cafe: CafeReportType | null, searchTerm: string, setSearchTerm: (term: string) => void, loading: boolean, filteredCafe: OrderCafe[] }) {
    return <div className="grid gap-3">
        <Card>
            <CardBody className="p-5">
                <div className="flex justify-between">
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <h3 className="text-xl font-bold">Total Transaksi Cafe</h3>
                            <h3 className="text-xl font-bold">Rp. {convertRupiah(cafe?.total_all.toString() || "0")}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">Diupdate pada tanggal: <b>{moment().format("DD/MM/YYYY")}</b></p>
                    </div>
                    <div>
                        <Coins />
                    </div>
                </div>
            </CardBody>
        </Card>
        <div className="w-full flex justify-end">
            <div className="max-w-[300px] w-full">
                <Input value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} autoFocus startContent={<Search className="w-5 h-5" />} placeholder="Cari nama/id order disini..." />
            </div>
        </div>
        <div>
            <DataTableCustom data={filteredCafe} columns={columns} pagination progressPending={loading} />
        </div>
    </div>
}

export default function CafeBilling() {
    const [loading, setLoading] = useState<boolean>(true);
    const [selected, setSelected] = useState<string>("today");
    const [cafe, setCafe] = useState<CafeReportType | null>(null);
    const [shift, setShift] = useState<string | null>(null)
    const [filteredCafe, setFilterdCafe] = useState<OrderCafe[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const getDataRincian = async (filter: string = "today") => {
        setLoading(true);
        try {

            console.log("shift", shift)
            const res = await window.api.cafe_report({ period: filter }, shift);
            setLoading(false);

            if (res.status && res.data) {
                console.log("res.data", res.data)
                setCafe(res.data);
            }
        } catch (err) {
            setLoading(false);
            toast.error(`Error fetching tables: ${err}`);
        }
    }

    useEffect(() => {
        getDataRincian(selected);
    }, [selected, shift]);


    const handleSearch = useCallback(debounce((term: string) => {
        if (!cafe) return;
        console.log("cafe", cafe)
        const filtered = cafe.order_cafe.filter((item) => {
            return (
                item.menucafe.name.toLowerCase().includes(term.toLowerCase()) ||
                item.id_order_cafe.toLowerCase().includes(term.toLowerCase())
            )
        });

        setFilterdCafe(filtered);
    }, 300), [cafe]);

    useEffect(() => {
        handleSearch(searchTerm);
    }, [searchTerm, handleSearch]);

    return (
        <>
            <div className="grid gap-3">
                <ReportTitle title={`Rincian Transaksi Cafe ${cafe?.period}`} setSelected={setSelected} />
                <Tabs aria-label="Options" onSelectionChange={(key) => setShift(key as unknown as string)}>
                    <Tab key="analytics" title="Analisis">
                        <TopSaleCafe />
                    </Tab>
                    <Tab key="all" title="Semua">
                        <CafeTable loading={loading} filteredCafe={filteredCafe} searchTerm={searchTerm} setSearchTerm={setSearchTerm} cafe={cafe} />
                    </Tab>
                    <Tab key="Pagi" title="Shift Siang">
                        <CafeTable loading={loading} filteredCafe={filteredCafe} searchTerm={searchTerm} setSearchTerm={setSearchTerm} cafe={cafe} />
                    </Tab>
                    <Tab key="Malam" title="Shift Malam">
                        <CafeTable loading={loading} filteredCafe={filteredCafe} searchTerm={searchTerm} setSearchTerm={setSearchTerm} cafe={cafe} />
                    </Tab>
                </Tabs>
            </div>

        </>
    )
}