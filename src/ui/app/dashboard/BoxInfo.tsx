import { Alert } from "@heroui/alert";
import { Card, CardBody } from "@heroui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IMachine } from "../../../electron/types";


export default function BoxInfo() {
    const [total, setTotal] = useState<{ all: number, used: number }>({ all: 0, used: 0 });
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

    const getTotal = async () => {
        try {
            const total_billing = await window.api.total_booking();

            if (total_billing.status && total_billing.data) {
                setTotal({
                    all: total_billing.data.total_all,
                    used: total_billing.data?.total_used
                })
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan : ${err}`);
        }
    }

    useEffect(() => {
        getTotal();
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
                            <div className="p-3 bg-muted hover:bg-muted/50 duration-300 transition-all rounded-md text-center cursor-pointer">
                                <h3 className="font-semibold">Total Booking Aktif Lantai 1</h3>
                                <h1 className="text-3xl font-bold text-primary-500 mt-2">{total.used}/{total.all}</h1>
                            </div>
                            <div className="p-3 bg-muted hover:bg-muted/50 duration-300 transition-all rounded-md text-center cursor-pointer">
                                <h3 className="font-semibold">Total Booking Aktif Lantai 2</h3>
                                <h1 className="text-3xl font-bold text-primary-500 mt-2">5/10</h1>
                            </div>
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