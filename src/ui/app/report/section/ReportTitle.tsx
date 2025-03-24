import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { Filter, Printer } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import PrintReport from "./modal/PrintReport";

export default function ReportTitle({ title, setSelected }: { title: string, setSelected: Dispatch<SetStateAction<string>> }) {
    const [open, setOpen] = useState<boolean>(false);
    return (
        <>
            <div className="flex justify-between">
                <h3 className="text-2xl font-bold">{title}</h3>
                <div className="flex gap-3">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button color="success"><Filter className="w-4 h-4" /> Filter</Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem key="today" onPress={() => setSelected("today")}>Hari Ini</DropdownItem>
                            <DropdownItem key="yesterday" onPress={() => setSelected("yesterday")}>Kemarin</DropdownItem>
                            <DropdownItem key="this_month" onPress={() => setSelected("this_month")}>Bulan Ini</DropdownItem>
                            <DropdownItem key="quarterly" onPress={() => setSelected("quarterly")}>Triwulan</DropdownItem>
                            <DropdownItem key="this_year" onPress={() => setSelected("this_year")}>Tahun Ini</DropdownItem>
                            <DropdownItem key="custom" onPress={() => setSelected("custom")}>Custom</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Button onPress={() => setOpen(true)} variant="bordered"><Printer className="w-4 h-4" /> Print Laporan Transaksi</Button>
                </div>
            </div>
            <PrintReport open={open} setOpen={setOpen} />
        </>
    )
}