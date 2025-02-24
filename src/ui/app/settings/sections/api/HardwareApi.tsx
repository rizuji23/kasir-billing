import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SerialPortInfo, Settings } from "../../../../../electron/types";
import { IResponses } from "../../../../../electron/lib/responses";
import { Form } from "@heroui/form";

interface IPortReturn {
    ports: SerialPortInfo[],
    settings: Settings
}

export default function HardwareApi() {
    const [ports, setPorts] = useState<SerialPortInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>("");

    const getPots = async () => {
        setLoading(true)
        try {
            const res: IResponses<IPortReturn> = await window.api.get_serialport()
            console.log("res", res)
            setLoading(false)
            if (res.status && res.data) {
                setPorts(res.data.ports);
                setSelected(res.data.settings?.content || "")
                setLoading(false)
            }
        } catch (err) {
            setLoading(false)
            toast.error(`Error fetching ports: ${err}`);
        }
    }

    const savePort = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true)
            const res = await window.api.save_port("PORT", selected, selected)
            setLoading(false);
            if (res.status) {
                toast.success("Port berhasil disimpan.");
                getPots();
            } else {
                console.log(res);
            }
        } catch (err) {
            setLoading(false)
            toast.error(`Error fetching save: ${err}`);
        }
    }

    useEffect(() => {
        getPots();
    }, []);

    return (
        <>
            <Form validationBehavior="native" onSubmit={savePort} className="block">
                <Card className="h-fit">
                    <CardHeader className="font-bold">Hardware</CardHeader>
                    <CardBody>
                        <div className="grid gap-3">
                            <Select label="COM Port" isRequired selectedKeys={[selected]} onChange={(e) => setSelected(e.target.value)} placeholder="Pilih COM Port disini" isLoading={loading}>
                                {
                                    ports.map((item) => (
                                        <SelectItem key={item.path} value={item.path}>{item.path}</SelectItem>
                                    ))
                                }

                            </Select>
                            <Divider />
                            <div className="grid gap-3">
                                <Alert color="danger" description={`"Reconnect Box Billing" atau Mengganti COM Port akan menyebabkan Lampu mati sesaat.
`} title={"PERHATIAN"} />
                                <div>
                                    <Button color="danger">Reconnect Box Billing</Button>
                                </div>
                            </div>
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