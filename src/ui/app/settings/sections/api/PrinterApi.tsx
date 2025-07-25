import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { IPrinters, Settings } from "../../../../../electron/types";
import { IResponses } from "../../../../../electron/lib/responses";
import { Form } from "@heroui/form";
import { RefreshCcw } from "lucide-react";
import SelectCustom from "../../../../components/SelectCustom";

interface IPrinterReturn {
    printers: IPrinters[],
    settings: Settings
}

export default function PrinterApi() {
    const [printer, setPrinter] = useState<IPrinters[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>("");

    const getPrinters = async () => {
        try {
            setLoading(true)
            const res = await window.api.get_printer() as unknown as IResponses<IPrinterReturn>
            console.log(res)
            if (res.status && res.data?.printers) {
                setPrinter(res.data.printers);
                setSelected(res.data.settings?.content || "")
                setLoading(false)
            } else {
                toast.error(`Failed to fetch printers: ${res.detail_message}`);
            }
        } catch (err) {
            setLoading(false)
            toast.error(`Error fetching printers: ${err}`);
        }
    }

    const savePrinter = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true)
        try {
            if (await window.api.confirm()) {
                const res = await window.api.save_printer("PRINTER", selected, selected)
                setLoading(false);
                if (res.status) {
                    toast.success("Printer berhasil disimpan.");
                    getPrinters();
                } else {
                    console.log(res);
                }
            } else {
                setLoading(false)
            }
        } catch (err) {
            setLoading(false)
            toast.error(`Error fetching save: ${err}`);
        }
    }

    useEffect(() => {
        getPrinters();
    }, [])

    return (
        <>
            <Form validationBehavior="native" onSubmit={savePrinter} className="block">
                <Card className="h-fit">
                    <CardHeader className="font-bold">Printer</CardHeader>
                    <CardBody>
                        <div className="grid gap-3">
                            <SelectCustom label="Nama Printer" onChange={(e) => setSelected(e.target.value)} value={selected}>
                                <SelectCustom.Option value="">Pilih Printer...</SelectCustom.Option>
                                {
                                    printer.map((item) => (
                                        <SelectCustom.Option value={item.name}>{item.displayName}</SelectCustom.Option>
                                    ))
                                }

                            </SelectCustom>
                        </div>
                    </CardBody>
                    <CardFooter className="justify-between">
                        <Button color="success" onPress={() => getPrinters()} startContent={<RefreshCcw className="w-4 h-4" />}>Refresh</Button>
                        <Button isLoading={loading} type="submit">Simpan Perubahan</Button>
                    </CardFooter>
                </Card>
            </Form>
        </>
    )
}