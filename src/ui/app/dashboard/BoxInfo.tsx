import { Alert } from "@heroui/alert";
import { Card, CardBody } from "@heroui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IMachine } from "../../../electron/types";


export default function BoxInfo() {
    const [status_machine, setStatusMachine] = useState<IMachine | undefined>(undefined);

    const getStatusMachine = async () => {
        try {
            const res = await window.api.get_status_machine();

            if (res.status && res.data) {
                setStatusMachine(res.data);
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan : ${err}`);
        }
    }

    useEffect(() => {
        getStatusMachine();
        setInterval(() => {
            getStatusMachine();
        }, 5000);
    }, []);

    return (
        <>
            <div className="w-[400px]">
                <Card>
                    <CardBody>
                        <div className="flex flex-col gap-3">
                            <div className="rounded-md px-1 flex flex-col gap-2">
                                <h3 className="font-semibold">Informasi:</h3>
                                <div className="grid gap-3 max-h-[240px] overflow-auto px-1">
                                    {
                                        status_machine?.status === undefined ? <Alert color="danger" variant="solid" title={"Box Tidak Dikenal!"} /> : status_machine.status === "CONNECTED" ? <Alert color="success" variant="solid" title={"Box Tersambung!"} /> : status_machine.status === "RECONNECTED" ? <Alert color="warning" variant="solid" title={"Box Sedang Reconnecting!"} /> : <Alert color="danger" variant="solid" title={"Box Tidak Tersambung!"} />
                                    }
                                    <Alert color="success" variant="bordered" title={"Server Local Terkoneksi"} />
                                    <Alert color="success" variant="bordered" title={"Server Cloud Terkoneksi"} />
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    )
}