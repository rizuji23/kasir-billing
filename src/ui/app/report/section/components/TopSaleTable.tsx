import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { useState } from "react"


export default function TopSaleTable() {
    const [loading, setLoading] = useState<boolean>(true);

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                    <h3 className="text-xl font-bold self-center">Penjualan Billiard Terbanyak</h3>
                </div>
                <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                    <Card>
                        <CardHeader>
                            <h3 className="font-bold">Meja Billiard</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <div className="grid gap-3">
                                <div className="flex justify-between">
                                    <div className="flex gap-2">
                                        <p className="text-sm">1.</p>
                                        <p className="font-normal text-sm">Table 01</p>
                                    </div>
                                    <p className="font-medium text-sm">Rp. 200.000</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </>
    )
}