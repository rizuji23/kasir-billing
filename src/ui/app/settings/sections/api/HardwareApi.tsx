import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { SerialPortInfo, Settings } from "../../../../../electron/types";
import { IResponses } from "../../../../../electron/lib/responses";
import { Form } from "@heroui/form";
import { RefreshCcw } from "lucide-react";
import SelectCustom from "../../../../components/SelectCustom";

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
            const res = await window.api.get_serialport() as unknown as IResponses<IPortReturn>
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
        setLoading(true)
        try {
            if (await window.api.confirm()) {

                const res = await window.api.save_port("PORT", selected, selected)
                setLoading(false);
                if (res.status) {
                    toast.success("Port berhasil disimpan.");
                    getPots();
                    handleReconnectBox();
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

    const handleReconnectBox = async () => {
        try {
            const res = await window.api.reconnect_box();
            if (res.data?.status) {
                toast.success("Box berhasil direstart");
            } else {
                toast.error("Box gagal direstart");
            }
        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`)
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
                            <SelectCustom label="COM Port" onChange={(e) => setSelected(e.target.value)} value={selected}>
                                <SelectCustom.Option value="">Pilih COM Port...</SelectCustom.Option>
                                {
                                    ports.map((item) => (
                                        <SelectCustom.Option value={item.path}>{item.friendlyName}</SelectCustom.Option>
                                    ))
                                }

                            </SelectCustom>
                            <Divider />
                            <div className="grid gap-3">
                                <Alert color="danger" description={`"Reconnect Box Billing" atau Mengganti COM Port akan menyebabkan Lampu mati sesaat.
`} title={"PERHATIAN"} />
                                <div>
                                    <Button color="danger" onPress={async () => {
                                        if (await window.api.confirm()) {
                                            handleReconnectBox();
                                        }
                                    }}>Reconnect Box Billing</Button>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter className="justify-between">
                        <Button color="success" onPress={() => getPots()} startContent={<RefreshCcw className="w-4 h-4" />}>Refresh</Button>
                        <Button isLoading={loading} type="submit">Simpan Perubahan</Button>
                    </CardFooter>
                </Card>
            </Form>
        </>
    )
}