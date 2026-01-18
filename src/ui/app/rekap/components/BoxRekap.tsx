import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Select, SelectItem } from "@heroui/select";
import { useState } from "react";
import { Input } from "@heroui/input";
import { IDateRange, IRekapModuleParams, PeriodeType, RekapType, TypePrint } from "../../../../electron/types";

interface Props {
    title: string,
    type_rekap: RekapType
}

interface IBoxRekapPrintParams {
    time: IRekapModuleParams;
    type_print: TypePrint;
}

export default function BoxRekap({ title, type_rekap }: Props) {
    const [selected_periode, setSelectedPeriode] = useState<PeriodeType>("");
    const [date, setDate] = useState<IDateRange>({ start_date: "", end_date: "" });

    const handlePrintPdf = async () => {
        const data_params: IBoxRekapPrintParams = {
            time: {
                periode: selected_periode,
                custom: date
            },
            type_print: "PDF"
        };

        switch (type_rekap) {
            case "rekap_penjualan_cafe": {
                const data = await window.api.rekap_penjualan_cafe(data_params);
                console.log("data", data);
                break;
            }

            default:
                return;
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="font-bold text-lg">{title}</CardHeader>
                <Divider />
                <CardBody>
                    <div className="grid gap-5">
                        <Select label="Pilih Periode" size="sm" onSelectionChange={(e) => setSelectedPeriode(e.currentKey as unknown as PeriodeType)}>
                            <SelectItem key={"today"}>Hari Ini</SelectItem>
                            <SelectItem key={"yesterday"}>Kemarin</SelectItem>
                            <SelectItem key={"monthly"}>Bulan Ini</SelectItem>
                            <SelectItem key={"annual"}>Tahun Ini</SelectItem>
                            <SelectItem key={"custom"}>Custom</SelectItem>
                        </Select>
                        {
                            selected_periode === "custom" && (
                                <>
                                    <Divider />
                                    <div className="grid grid-cols-2 gap-5">
                                        <Input label="Dari Tanggal" onChange={(e) => setDate((prev) => ({
                                            ...prev,
                                            start_date: e.target.value
                                        }))} value={date.start_date} type="date" />
                                        <Input label="Sampai Tanggal" onChange={(e) => setDate((prev) => ({
                                            ...prev,
                                            end_date: e.target.value
                                        }))} value={date.end_date} type="date" />
                                    </div>
                                </>
                            )
                        }
                    </div>
                </CardBody>
                <Divider />
                <CardFooter className="grid grid-cols-2 gap-5">
                    <Button size="sm" startContent={<FileSpreadsheet className="w-4 h-4" />}>Simpan Sebagai Excel</Button>
                    <Button size="sm" onPress={handlePrintPdf} startContent={<FileText className="w-4 h-4" />}>Simpan Sebagai PDF</Button>
                </CardFooter>
            </Card>
        </>
    )
}