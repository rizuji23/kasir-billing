import { Card, CardBody } from "@heroui/card";
import MainLayout from "../../components/MainLayout";
import { Button } from "@heroui/button";
import { Power, PowerOff } from "lucide-react";
import { Divider } from "@heroui/divider";
import { useEffect, useState } from "react";
import { TableBilliard } from "../../../electron/types";
import { IResponses } from "../../../electron/lib/responses";
import { toast } from "sonner";
import { Chip } from "@heroui/chip";

interface ExtendsTableBilliard extends TableBilliard {
    getTables: () => Promise<void>,
}

function BoxLamp(props: ExtendsTableBilliard) {
    const handleOn = async () => {
        try {
            if (confirm("Apakah anda yakin?")) {
                const res = await window.api.send_on({ id_table: props.id_table, number: props.number || "" });

                if (res.status) {
                    props.getTables();
                    toast.success(`Table ${props.name} Berhasil dinyalakan`);
                }
            }

        } catch (err) {
            toast.error(`Error lamp table: ${err}`);
        }
    }

    const handleOff = async () => {
        try {
            if (confirm("Apakah anda yakin?")) {
                const res = await window.api.send_off({ id_table: props.id_table, number: props.number || "" });

                if (res.status) {
                    props.getTables();
                    toast.success(`Table ${props.name} Berhasil dimatikan`);
                }
            }

        } catch (err) {
            toast.error(`Error lamp table: ${err}`);
        }
    }

    return <Card>
        <CardBody>
            <div className="grid gap-2">
                <div>
                    <h3 className="font-bold text-lg">{props.name}</h3>
                    <small>Status: <Chip color={props.power === "ON" ? "success" : "danger"} size="sm">{props.power}</Chip></small>
                </div>
                <div className="grid gap-3 grid-cols-2">
                    <Button onPress={handleOn} startContent={<Power className="w-4 h-4" />}>Turn On</Button>
                    <Button onPress={handleOff} startContent={<PowerOff className="w-4 h-4" />} color="danger">Turn Off</Button>
                </div>
            </div>
        </CardBody>
    </Card>
}

export default function ManualLamp() {
    const [table_list, setTableList] = useState<TableBilliard[]>([]);

    const getTables = async () => {
        try {
            const res: IResponses<TableBilliard[]> = await window.api.table_list();

            if (res.status && res.data) {
                setTableList(res.data);
            } else {
                toast.error(`Failed to fetch table list: ${res.detail_message}`);
            }
        } catch (err) {
            toast.error(`Error fetching tables: ${err}`);
        }
    };

    const handleOnOffAll = async (status: string) => {
        try {
            if (confirm("Apakah anda yakin?")) {
                const res = await window.api.on_off_all(status);

                if (res.status) {
                    getTables();
                    toast.success(`Semua Table Berhasil ${status === "ON_ALL" ? "Dinyalakan" : "Dimatikan"}`);
                }
            }

        } catch (err) {
            toast.error(`Error lamp table: ${err}`);
        }
    }

    useEffect(() => {
        getTables();
    }, [])

    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">Manual Lampu</h1>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                        {
                            table_list.map((el, i) => {
                                return <BoxLamp key={i} {...el} getTables={getTables} />
                            })
                        }
                    </div>
                    <Divider />
                    <div className="max-w-[300px]">
                        <Card>
                            <CardBody>
                                <div className="grid gap-3">
                                    <h3 className="font-bold text-lg">{"Semua Table"}</h3>
                                    <div className="grid gap-3 grid-cols-2">
                                        <Button onPress={() => handleOnOffAll("ON_ALL")} startContent={<Power className="w-4 h-4" />}>Turn On</Button>
                                        <Button onPress={() => handleOnOffAll("OFF_ALL")} startContent={<PowerOff className="w-4 h-4" />} color="danger">Turn Off</Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </MainLayout>
        </>
    )
}