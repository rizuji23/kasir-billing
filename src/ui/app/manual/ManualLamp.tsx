import { Card, CardBody } from "@heroui/card";
import MainLayout from "../../components/MainLayout";
import { Button } from "@heroui/button";
import { Power, PowerOff } from "lucide-react";
import { Divider } from "@heroui/divider";

function BoxLamp() {
    return <Card>
        <CardBody>
            <div className="grid gap-3">
                <h3 className="font-bold text-lg">Table 01</h3>
                <div className="grid gap-3 grid-cols-2">
                    <Button startContent={<Power className="w-4 h-4" />}>Turn On</Button>
                    <Button startContent={<PowerOff className="w-4 h-4" />} color="danger">Turn Off</Button>
                </div>
            </div>
        </CardBody>
    </Card>
}

export default function ManualLamp() {
    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">Manual Lampu</h1>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                        {
                            Array.from({ length: 10 }).map((_, i) => {
                                return <BoxLamp key={i} />
                            })
                        }
                    </div>
                    <Divider />
                    <div className="max-w-[300px]">
                        <BoxLamp />
                    </div>
                </div>
            </MainLayout>
        </>
    )
}