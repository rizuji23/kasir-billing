import { Coins, Search, Timer } from "lucide-react";
import DataTableCustom from "../../../components/datatable/DataTableCustom";
import { TableColumn } from "react-data-table-component";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import { cn, convertRupiah } from "../../../lib/utils";
import ReportTitle from "./ReportTitle";
import { Booking } from "../../../../electron/types";
import moment from "moment-timezone";
import { useCallback, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { debounce } from "lodash";

const columns: TableColumn<Booking>[] = [
    {
        name: "No",
        selector: row => row?.no || "0",
        width: "60px"
    },
    {
        name: "ID Booking",
        selector: row => row.id_booking,
        cell: row => <Chip color="success" size="sm" classNames={{
            content: "font-semibold"
        }}>{row.id_booking}</Chip>
    },
    {
        name: "Pelanggan",
        selector: row => row.name,
        sortable: true
    },
    {
        name: "Table",
        selector: row => row.table.name,
        sortable: true,
    },
    {
        name: "Durasi",
        selector: row => row.duration,
        sortable: true,
        cell: row => `${row.duration} Jam`
    },
    {
        name: "Total",
        selector: row => row.total_price,
        sortable: true,
        cell: row => convertRupiah(row.total_price.toString() || "0")
    },
    {
        name: "Shift",
        selector: row => row?.shift || "" as unknown as string,
        sortable: true,
        cell: row => <Chip size="sm" className={cn("capitalize", row.shift === "Pagi" ? "bg-yellow-600" : "bg-slate-500")}>{row.shift}</Chip>
    },
    {
        name: "Tanggal",
        selector: row => moment(row.created_at).format("DD/MM/YYYY HH:mm"),
        sortable: true
    }
]

interface BillingReportType {
    booking: Booking[],
    total_all: number,
    period: string,
    total_duration: number
}

export default function BilliardReport() {
    const [loading, setLoading] = useState<boolean>(true);
    const [selected, setSelected] = useState<string>("today");
    const [billing, setBilling] = useState<BillingReportType | null>(null);
    const [shift, setShift] = useState<string | null>(null)
    const [filteredBilling, setFilterdBilling] = useState<Booking[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const getDataRincian = async ({ filter = "today", start_date = "", end_date = "" }: { filter?: string; start_date?: string; end_date?: string }) => {
        setLoading(true);
        try {
            console.log("shift", shift)
            const res = await window.api.billing_report({ period: filter, start_date, end_date }, shift);
            setLoading(false);

            if (res.status && res.data) {
                console.log("res.data", res.data);
                const data_booking = {
                    ...res.data,
                    booking: res.data.booking.map((el, i) => ({ ...el, no: i + 1 })),
                }
                setBilling(data_booking);
                return true;
            }
        } catch (err) {
            setLoading(false);
            toast.error(`Error fetching tables: ${err}`);
            return false;
        }
    }

    useEffect(() => {
        if (selected !== "customs") {
            getDataRincian({ filter: selected });
        }
    }, [selected, shift]);

    const handleSearch = useCallback(debounce((term: string) => {
        if (!billing) return;
        console.log("billing", billing)
        const filtered = billing.booking.filter((item) => {
            return (
                item.name.toLowerCase().includes(term.toLowerCase()) ||
                item.id_booking.toLowerCase().includes(term.toLowerCase())
            )
        });

        setFilterdBilling(filtered);
    }, 300), [billing]);

    useEffect(() => {
        handleSearch(searchTerm);
    }, [searchTerm, handleSearch]);



    return (
        <>
            <div className="grid gap-3">
                <ReportTitle title={`Rincian Transaksi Billing`} desc={billing?.period} setSelected={setSelected} getDataRincian={getDataRincian} loading={loading} />
                <Tabs aria-label="Options" onSelectionChange={(key) => setShift(key as unknown as string)}>
                    <Tab key="all" title="Semua" />
                    <Tab key="Pagi" title="Shift Siang" />
                    <Tab key="Malam" title="Shift Malam" />
                </Tabs>
                <div className="grid grid-cols-2 gap-3">
                    <Card>
                        <CardBody className="p-5">
                            <div className="flex justify-between">
                                <div className="flex flex-col gap-4">
                                    <div className="grid gap-2">
                                        <h3 className="text-xl font-bold">Total Transaksi Billiard</h3>
                                        <h3 className="text-xl font-bold">Rp. {convertRupiah(billing?.total_all.toString() || "0")}</h3>
                                    </div>

                                </div>
                                <div>
                                    <Coins />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="p-5">
                            <div className="flex justify-between">
                                <div className="flex flex-col gap-4">
                                    <div className="grid gap-2">
                                        <h3 className="text-xl font-bold">Total Durasi</h3>
                                        <h3 className="text-xl font-bold">{billing?.total_duration || "0"} Jam</h3>
                                    </div>

                                </div>
                                <div>
                                    <Timer />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
                <div className="w-full flex justify-end">
                    <div className="max-w-[300px] w-full">
                        <Input value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} autoFocus startContent={<Search className="w-5 h-5" />} placeholder="Cari nama/id booking disini..." />
                    </div>
                </div>
                <div>
                    <DataTableCustom data={filteredBilling} columns={columns} pagination progressPending={loading} />
                </div>
            </div>
        </>
    )
}