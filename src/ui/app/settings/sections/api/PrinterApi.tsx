import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IPrinters, Settings } from "../../../../../electron/types";
import { IResponses } from "../../../../../electron/lib/responses";
import { Form } from "@heroui/form";

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
            const res: IResponses<IPrinterReturn> = await window.api.get_printer()
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
        try {
            setLoading(true)
            const res = await window.api.save_printer("PRINTER", selected, selected)
            setLoading(false);
            if (res.status) {
                toast.success("Printer berhasil disimpan.");
                getPrinters();
            } else {
                console.log(res);
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
                            <Select label="Nama Printer" isRequired selectedKeys={[selected]} onChange={(e) => setSelected(e.target.value)} placeholder="Pilih Printer disini" isLoading={loading}>
                                {
                                    printer.map((item) => (
                                        <SelectItem key={item.name} value={item.name}>{item.displayName}</SelectItem>
                                    ))
                                }
                            </Select>

                        </div>
                    </CardBody>
                    <CardFooter className="justify-end">
                        <Button isLoading={loading} type="submit">Simpan Perubahan</Button>
                    </CardFooter>
                </Card>
            </Form>
        </>
    )
}