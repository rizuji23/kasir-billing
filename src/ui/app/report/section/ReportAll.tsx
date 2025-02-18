import { Card, CardBody } from "@heroui/card";
import { Coins, Moon, Sun, Utensils } from "lucide-react";
import ReportTitle from "./ReportTitle";

export default function ReportAll() {
    return (
        <>
            <div className="grid gap-3">
                <ReportTitle title="Total Transaksi" />
                <div className="grid grid-cols-2 gap-5">
                    <Card isPressable isHoverable>
                        <CardBody className="p-5">
                            <div className="flex justify-between">
                                <div className="flex flex-col gap-4">
                                    <div className="grid gap-2">
                                        <h3 className="text-xl font-bold">Total Billing Billiard</h3>
                                        <h3 className="text-xl font-bold">Rp. 100.000</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Diupdate pada tanggal: <b>20/05/2025</b></p>
                                </div>
                                <Coins />
                            </div>
                        </CardBody>
                    </Card>
                    <Card isPressable isHoverable>
                        <CardBody className="p-5">
                            <div className="flex justify-between">
                                <div className="flex flex-col gap-4">
                                    <div className="grid gap-2">
                                        <h3 className="text-xl font-bold">Total Cafe</h3>
                                        <h3 className="text-xl font-bold">Rp. 100.000</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Diupdate pada tanggal: <b>20/05/2025</b></p>
                                </div>
                                <Utensils />
                            </div>
                        </CardBody>
                    </Card>
                    <Card isPressable isHoverable>
                        <CardBody className="p-5">
                            <div className="flex justify-between">
                                <div className="flex flex-col gap-4">
                                    <div className="grid gap-2">
                                        <h3 className="text-xl font-bold">Total Shift Pagi</h3>
                                        <h3 className="text-xl font-bold">Rp. 100.000</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Diupdate pada tanggal: <b>20/05/2025</b></p>
                                </div>
                                <Sun />
                            </div>
                        </CardBody>
                    </Card>
                    <Card isPressable isHoverable>
                        <CardBody className="p-5">
                            <div className="flex justify-between">
                                <div className="flex flex-col gap-4">
                                    <div className="grid gap-2">
                                        <h3 className="text-xl font-bold">Total Shift Malam</h3>
                                        <h3 className="text-xl font-bold">Rp. 100.000</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Diupdate pada tanggal: <b>20/05/2025</b></p>
                                </div>
                                <Moon />
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="p-5">
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-5">
                                    <h3 className="text-xl font-bold">Meja Terpopuler</h3>
                                    <div className="w-full max-h-[300px] grid gap-3">
                                        {
                                            Array.from({ length: 5 }).map((_, i) => {
                                                return <div key={i} className="flex justify-between p-3 bg-muted rounded-md">
                                                    <h5 className="font-medium">Table {i}</h5>
                                                    <span className="font-bold">1{i * 7} Kali</span>
                                                </div>
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="p-5">
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-5">
                                    <h3 className="text-xl font-bold">Menu Terpopuler</h3>
                                    <div className="w-full max-h-[300px] grid gap-3">
                                        {
                                            Array.from({ length: 5 }).map((_, i) => {
                                                return <div key={i} className="flex justify-between p-3 bg-muted rounded-md">
                                                    <h5 className="font-medium">Nasi Goreng</h5>
                                                    <span className="font-bold">1{i * 5} Transaksi</span>
                                                </div>
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

            </div>
        </>
    )
}