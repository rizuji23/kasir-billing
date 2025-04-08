import { Coins, GlassWater, Joystick, Search } from "lucide-react";
import DataTableCustom from "../../../components/datatable/DataTableCustom";
import { TableColumn } from "react-data-table-component";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import ReportTitle from "./ReportTitle";
import { Struk } from "../../../../electron/types";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import moment from "moment-timezone";
import { cn, convertRupiah } from "../../../lib/utils";
import DetailTransaction from "./modal/DetailTransaction";
import { debounce } from "lodash";
import { Button } from "@heroui/button";

const columns = (setOpen: Dispatch<SetStateAction<{ open: boolean, row: Struk | null }>>): TableColumn<Struk>[] => {
    return [
        {
            name: "No",
            selector: row => row?.no || "0",
            width: "60px"
        },
        {
            name: "ID Order",
            selector: row => row.id_struk,
            cell: row => <Button onPress={() => setOpen({
                open: true,
                row: row
            })} color="success" className="font-bold text-xs py-2" size="sm">{row.id_struk}</Button>,
            width: "200px"
        },
        {
            name: "Pelanggan",
            selector: row => row.name,
            cell: row => <span className="font-bold">{row.name}</span>,
            wrap: true
        },
        {
            name: "Billing",
            selector: row => row.total_billing || 0,
            cell: row => row.total_billing ? convertRupiah(row.total_billing?.toString() || "0") : "-",
            sortable: true
        },
        {
            name: "Cafe",
            selector: row => row.total_cafe || 0,
            cell: row => row.total_cafe ? convertRupiah(row.total_cafe?.toString() || "0") : "-",
            sortable: true
        },
        {
            name: "Total",
            selector: row => row.total,
            cell: row => convertRupiah(row.total.toString() || "0"),
            sortable: true
        },
        {
            name: "Tipe Transaksi",
            selector: row => row.type_struk,
            sortable: true,
            cell: row => <Chip size="sm" color={row.type_struk === "CAFEONLY" ? "warning" : row.type_struk === "TABLE" ? "success" : "danger"} className="capitalize">{row.type_struk.toLowerCase()}</Chip>
        },
        {
            name: "Via",
            selector: row => row.payment_method,
            sortable: true,
            cell: row => <Chip size="sm" className={cn("capitalize", row.payment_method === "CASH" ? "bg-blue-500" : row.payment_method === "TRANSFER" ? "bg-purple-500" : "bg-pink-400")}>{row.payment_method.toLowerCase()}</Chip>
        },
        {
            name: "Shift",
            selector: row => row?.shift || "" as unknown as string,
            sortable: true,
            cell: row => <Chip size="sm" className={cn("capitalize", row.shift === "Pagi" ? "bg-yellow-600" : "bg-slate-500")}>{row.shift}</Chip>
        },
        {
            name: "Tanggal",
            sortable: true,
            wrap: true,
            cell: row => <p className="text-center text-xs">{moment(row.created_at).format("DD/MM/YYYY HH:mm")}</p>
        },
    ]
}

interface RincianReportType {
    struk: Struk[];
    total_all: number;
    total_booking: number;
    total_cafe: number;
    period: string;
}

export default function RincianReport() {
    const [rincian, setRincian] = useState<RincianReportType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selected, setSelected] = useState<string>("today");
    const [detail, setDetail] = useState<{ open: boolean, row: Struk | null }>({
        open: false,
        row: null
    });
    const [shift, setShift] = useState<string | null>(null)
    const [filteredStruk, setFilterdStruk] = useState<Struk[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const getDataRincian = async ({ filter = "today", start_date = "", end_date = "" }: { filter?: string; start_date?: string; end_date?: string }) => {
        setLoading(true);
        try {
            console.log("shift", shift)
            const res = await window.api.rincian_transaction({ period: filter, start_date, end_date }, shift);
            setLoading(false);

            if (res.status && res.data) {
                console.log("res.data", res.data)
                const data_struk = {
                    ...res.data,
                    struk: res.data.struk.map((el, i) => {
                        return { ...el, no: i + 1 }
                    })
                }
                setRincian(data_struk);
                return true
            }
        } catch (err) {
            setLoading(false);
            toast.error(`Error fetching tables: ${err}`);
            return false
        }
    };


    useEffect(() => {
        if (selected !== "customs") {
            getDataRincian({ filter: selected });
        }
    }, [selected, shift]);

    const handleSearch = useCallback(debounce((term: string) => {
        if (!rincian) return;

        const filtered = rincian.struk.filter((item) => {
            return (
                item.name.toLowerCase().includes(term.toLowerCase()) ||
                item.id_struk.toLowerCase().includes(term.toLowerCase())
            )
        });

        setFilterdStruk(filtered);
    }, 300), [rincian]);

    useEffect(() => {
        handleSearch(searchTerm);
    }, [searchTerm, handleSearch]);

    return (
        <>
            <div className="grid gap-3">
                <ReportTitle title={`Rincian Transaksi`} desc={`(${rincian?.period})`} setSelected={setSelected} loading={loading} getDataRincian={getDataRincian} />
                <Tabs aria-label="Options" onSelectionChange={(key) => setShift(key as unknown as string)}>
                    <Tab key="all" title="Semua" />
                    <Tab key="Pagi" title="Shift Siang" />
                    <Tab key="Malam" title="Shift Malam" />
                </Tabs>
                <div className="grid grid-cols-3 gap-3">
                    <Card>
                        <CardBody className="p-5">
                            <div className="flex justify-between">
                                <div className="flex flex-col gap-4">
                                    <div className="grid gap-2">
                                        <h3 className="text-xl font-bold">Total Semua</h3>
                                        <h3 className="text-xl font-bold">Rp. {convertRupiah(rincian?.total_all.toString() || "0")}</h3>
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
                                        <h3 className="text-xl font-bold">Total Billing</h3>
                                        <h3 className="text-xl font-bold">Rp. {convertRupiah(rincian?.total_booking.toString() || "0")}</h3>
                                    </div>

                                </div>
                                <div>
                                    <Joystick />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="p-5">
                            <div className="flex justify-between">
                                <div className="flex flex-col gap-4">
                                    <div className="grid gap-2">
                                        <h3 className="text-xl font-bold">Total Cafe</h3>
                                        <h3 className="text-xl font-bold">Rp. {convertRupiah(rincian?.total_cafe.toString() || "0")}</h3>
                                    </div>

                                </div>
                                <div>
                                    <GlassWater />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
                <div className="w-full flex justify-end">
                    <div className="max-w-[300px] w-full">
                        <Input value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} autoFocus startContent={<Search className="w-5 h-5" />} placeholder="Cari nama/id order disini..." />
                    </div>
                </div>
                <div>
                    <DataTableCustom data={filteredStruk} columns={columns(setDetail)} pagination progressPending={loading} />
                </div>
            </div>
            <DetailTransaction open={detail} setOpen={setDetail} />

        </>
    )
}