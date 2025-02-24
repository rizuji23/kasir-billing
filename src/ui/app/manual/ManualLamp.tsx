import { Card, CardBody } from "@heroui/card";
import MainLayout from "../../components/MainLayout";
import { Button } from "@heroui/button";
import { Power, PowerOff } from "lucide-react";
import { Divider } from "@heroui/divider";
import { useEffect, useState } from "react";
import { TableBilliard } from "../../../electron/types";
import { IResponses } from "../../../electron/lib/responses";
import { toast } from "sonner";

function BoxLamp({ name, number }: { name: string, number: string }) {
    return <Card>
        <CardBody>
            <div className="grid gap-3">
                <h3 className="font-bold text-lg">{name}</h3>
                <div className="grid gap-3 grid-cols-2">
                    <Button startContent={<Power className="w-4 h-4" />}>Turn On</Button>
                    <Button startContent={<PowerOff className="w-4 h-4" />} color="danger">Turn Off</Button>
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
                                return <BoxLamp key={i} {...el} />
                            })
                        }
                    </div>
                    <Divider />
                    <div className="max-w-[300px]">
                        <BoxLamp name="Semua Table" />
                    </div>
                </div>
            </MainLayout>
        </>
    )
}