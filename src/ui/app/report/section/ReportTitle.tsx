import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { Filter, Soup, Wallet } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import PrintReport from "./modal/PrintReport";
import ModalCustomFilter from "./components/ModalCustomFIlter";
import PrintReportCafe from "./modal/PrintReportCafe";

interface ReportTitleInterface {
    title: string,
    setSelected: Dispatch<SetStateAction<string>>,
    getDataRincian: (params: { filter?: string; start_date?: string; end_date?: string }) => Promise<boolean | undefined>;
    loading: boolean,
    desc: string | undefined
}

export default function ReportTitle({ title, desc, setSelected, getDataRincian, loading }: ReportTitleInterface) {
    const [open, setOpen] = useState<boolean>(false);
    const [open_custom, setOpenCustom] = useState<boolean>(false);
    const [open_cafe, setOpenCafe] = useState<boolean>(false);

    return (
        <>
            <div className="flex justify-between mb-1">
                <div className="grid gap-1">
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <small className="font-bold">{desc}</small>
                </div>
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
                            <DropdownItem key="customs" onPress={() => setOpenCustom(true)}>Custom</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Button onPress={() => setOpen(true)} variant="bordered"><Wallet className="w-4 h-4" /> Print Laporan Semua Omset</Button>
                    <Button onPress={() => setOpenCafe(true)} startContent={<Soup className="w-4 h-4" />}>Print Laporan Cafe</Button>
                </div>
            </div>
            <PrintReport open={open} setOpen={setOpen} />
            <ModalCustomFilter open_custom={open_custom} setOpenCustom={setOpenCustom} getDataRincian={getDataRincian} loading={loading} />
            <PrintReportCafe open={open_cafe} setOpen={setOpenCafe} />
        </>
    )
}