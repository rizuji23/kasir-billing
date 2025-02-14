import { Alert } from "@heroui/alert";
import { Card, CardBody } from "@heroui/card";
import { MessageCircle } from "lucide-react";


export default function BoxInfo() {
    return (
        <>
            <div className="w-[400px]">
                <Card>
                    <CardBody>
                        <div className="flex flex-col gap-3">
                            <div className="p-3 bg-muted rounded-md text-center">
                                <h3 className="font-semibold">Total Booking Aktif</h3>
                                <h1 className="text-3xl font-bold text-primary-500 mt-2">1/10</h1>
                            </div>
                            <div className="p-3 bg-muted rounded-md text-center grid gap-3">
                                <div>
                                    <h3 className="font-semibold">Jam</h3>
                                    <h1 className="text-2xl font-bold text-primary-500 mt-2">12:00:00</h1>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Shift</h3>
                                    <h1 className="text-2xl font-bold text-primary-500 mt-2">Malam</h1>
                                </div>
                            </div>
                            <div className="rounded-md px-1 flex flex-col gap-2">
                                <h3 className="font-semibold">Notifikasi:</h3>
                                <div className="grid gap-3 max-h-[240px] overflow-auto px-1">
                                    {
                                        Array.from({ length: 10 }).map((_, i) => {
                                            return <Alert key={i} icon={<MessageCircle className="!w-4 !h-4" />} title="Ada Pesan Masuk" description="Meja 11 kosong?" color="primary" />
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    )
}