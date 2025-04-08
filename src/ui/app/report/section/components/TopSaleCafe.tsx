import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoadingComponent } from "../../../../components/datatable/DataTableCustom";
import NotFound from "../../../../components/NotFound";

interface SalesItem {
    menuName: string;
    totalSold: number;
}

interface SalesByCategory {
    [category: string]: SalesItem[];
}

export default function TopSaleCafe() {
    const [loading, setLoading] = useState<boolean>(true);
    const [topSales, setTopSales] = useState<SalesByCategory | null>(null);

    const getAnalyticsCafe = async () => {
        setLoading(true);
        try {
            const res = await window.api.top_sale_cafe();

            setLoading(false);

            if (res.status && res.data) {
                console.log("analytics", res.data);
                setTopSales(res.data);
            }
        } catch (err) {
            setLoading(false);
            toast.error(`Error fetching tables: ${err}`);
        }
    }

    useEffect(() => {
        getAnalyticsCafe();
    }, [])

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                    <h3 className="text-xl font-bold self-center">Penjualan Cafe Terbanyak Berdasarkan Kategori</h3>
                </div>

                {
                    loading ? <LoadingComponent /> :
                        topSales ?
                            <>
                                <div className="grid grid-cols-3 gap-5">
                                    {
                                        Object.entries(topSales).map(([category, items], i) => {
                                            return <Card key={i}>
                                                <CardHeader>
                                                    <h4 className="font-bold">Top 5 {category}</h4>
                                                </CardHeader>
                                                <Divider />
                                                <CardBody>
                                                    <div className="grid gap-3">
                                                        {
                                                            items.map((el, i) => {
                                                                return <div className="flex justify-between" key={i}>
                                                                    <div className="flex gap-2">
                                                                        <p className="text-sm">{i + 1}.</p>
                                                                        <p className="font-normal text-sm">{el.menuName}</p>
                                                                    </div>
                                                                    <p className="font-medium text-sm">{el.totalSold}</p>
                                                                </div>
                                                            })
                                                        }

                                                    </div>
                                                </CardBody>
                                            </Card>
                                        })
                                    }
                                </div>
                            </>

                            : <NotFound />
                }

            </div>
        </>
    )
}