import { Coins, Search } from "lucide-react";
import DataTableCustom from "../../../components/datatable/DataTableCustom";
import { TableColumn } from "react-data-table-component";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import { cn } from "../../../lib/utils";
import ReportTitle from "./ReportTitle";

interface ExampleTransaction {
    id_order: string,
    name: string,
    total: string,
    shift: string,
    created_at: string
}

const columns: TableColumn<ExampleTransaction>[] = [
    {
        name: "ID Order",
        selector: row => row.id_order,
        cell: row => <Chip color="success" size="sm" classNames={{
            content: "font-semibold"
        }}>{row.id_order}</Chip>
    },
    {
        name: "Nama Pelanggan",
        selector: row => row.name,
        sortable: true
    },
    {
        name: "Total",
        selector: row => row.total,
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
        selector: row => row.created_at,
        sortable: true
    }
]

export default function CafeBilling() {
    return (
        <>
            <div className="grid gap-3">
                <ReportTitle title="Rincian Transaksi Cafe" />
                <Tabs aria-label="Options">
                    <Tab key="all" title="Semua" />
                    <Tab key="sun" title="Shift Siang" />
                    <Tab key="moon" title="Shift Malam" />
                </Tabs>
                <Card>
                    <CardBody className="p-5">
                        <div className="flex justify-between">
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <h3 className="text-xl font-bold">Total Transaksi Cafe</h3>
                                    <h3 className="text-xl font-bold">Rp. 300.000</h3>
                                </div>
                                <p className="text-xs text-muted-foreground">Diupdate pada tanggal: <b>20/05/2025</b></p>
                            </div>
                            <div>
                                <Coins />
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <div className="w-full flex justify-end">
                    <div className="max-w-[300px] w-full">
                        <Input autoFocus startContent={<Search className="w-5 h-5" />} placeholder="Cari nama/id order disini..." />
                    </div>
                </div>
                <div>
                    <DataTableCustom data={[
                        {
                            id_order: "ORD00023",
                            name: "M Rizki Fauzi",
                            total: "Rp. 300.000",
                            shift: "malam",
                            created_at: "20/05/2025 12:00 AM"
                        }
                    ]} columns={columns} pagination />
                </div>
            </div>
        </>
    )
}