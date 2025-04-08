import { Card, CardBody } from "@heroui/card";
import MainLayout from "../../components/MainLayout";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { useEffect, useState } from "react";
import { TableBilliard } from "../../../electron/types";
import { IResponses } from "../../../electron/lib/responses";
import toast from 'react-hot-toast';

interface ExtendsTableBilliard extends TableBilliard {
    getTables: () => Promise<void>,
}

function BoxLamp(props: ExtendsTableBilliard) {
    const handleOn = async () => {
        try {
            const confirm = window.api.confirm();
            if (await confirm) {
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
            const confirm = window.api.confirm();
            if (await confirm) {
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

    const handleBlink = async () => {
        try {
            const confirm = window.api.confirm();
            if (await confirm) {
                const res = await window.api.send_blink(props.number || "");

                if (res.status) {
                    toast.success(res.detail_message || "");
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
                </div>
                <div className="grid gap-3 grid-cols-2">
                    <Button onPress={handleOn} size="sm">Turn On</Button>
                    <Button onPress={handleOff} size="sm" color="danger">Turn Off</Button>
                </div>
                <Button size="sm" color="secondary" onPress={handleBlink}>Test Blink</Button>
            </div>
        </CardBody>
    </Card>
}

export default function ManualLamp() {
    const [table_list, setTableList] = useState<TableBilliard[]>([]);

    const getTables = async () => {
        try {
            const res: IResponses<TableBilliard[]> = await window.api.table_list_only();

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
            const confirm = window.api.confirm();
            if (await confirm) {
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
                                        <Button onPress={() => handleOnOffAll("ON_ALL")}>Turn On</Button>
                                        <Button onPress={() => handleOnOffAll("OFF_ALL")} color="danger">Turn Off</Button>
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