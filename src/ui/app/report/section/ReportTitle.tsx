import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { Filter, Printer } from "lucide-react";
import { useState } from "react";
import PrintReport from "./modal/PrintReport";

export default function ReportTitle({ title }: { title: string }) {
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
                        <DropdownMenu aria-label="Static Actions">
                            <DropdownItem key="new">Hari Ini</DropdownItem>
                            <DropdownItem key="new">Bulan Ini</DropdownItem>
                            <DropdownItem key="copy">Triwulan</DropdownItem>
                            <DropdownItem key="edit">Tahun Ini</DropdownItem>
                            <DropdownItem key="edit">Custom</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Button onPress={() => setOpen(true)} variant="bordered"><Printer className="w-4 h-4" /> Print Laporan</Button>
                </div>
            </div>
            <PrintReport open={open} setOpen={setOpen} />
        </>
    )
}