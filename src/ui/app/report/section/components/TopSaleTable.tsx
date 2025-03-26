import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";
import { convertRupiah } from "../../../../lib/utils";
import { LoadingComponent } from "../../../../components/datatable/DataTableCustom";

interface TableRevenue {
    tableName: string;
    totalRevenue: number;
}


export default function TopSaleTable() {
    const [topTables, setTopTables] = useState<TableRevenue[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const getAnalyticsBillard = async () => {
        setLoading(true);
        try {
            const res = await window.api.top_sale_billiard();

            setLoading(false);

            if (res.status && res.data) {
                console.log("analytics", res.data);
                setTopTables(res.data);
            }
        } catch (err) {
            setLoading(false);
            toast.error(`Error fetching tables: ${err}`);
        }
    }

    useEffect(() => {
        getAnalyticsBillard();
    }, [])

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                    <h3 className="text-xl font-bold self-center">Penjualan Billiard per Meja</h3>
                </div>
                <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                    {
                        loading ? <LoadingComponent /> : <Card>
                            <CardHeader>
                                <h3 className="font-bold">Meja Billiard</h3>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <div className="grid gap-3">
                                    {
                                        topTables.map((el, i) => {
                                            return <div className="flex justify-between" key={i}>
                                                <div className="flex gap-2">
                                                    <p className="font-normal text-sm">{el.tableName}</p>
                                                </div>
                                                <p className="font-medium text-sm">Rp. {convertRupiah(el.totalRevenue.toString() || "0")}</p>
                                            </div>
                                        })
                                    }
                                </div>
                            </CardBody>
                        </Card>
                    }
                </div>
            </div>
        </>
    )
}