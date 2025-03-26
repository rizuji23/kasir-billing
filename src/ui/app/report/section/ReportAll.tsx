import { Card, CardBody } from "@heroui/card";
import { Coins, Moon, Sun, Utensils } from "lucide-react";
import ReportTitle from "./ReportTitle";
import moment from "moment-timezone";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { LoadingComponent } from "../../../components/datatable/DataTableCustom";
import { convertRupiah } from "../../../lib/utils";
import TopSaleCafe from "./components/TopSaleCafe";
import TopSaleTable from "./components/TopSaleTable";
import { Tabs, Tab } from "@heroui/react";

interface SummaryReportType {
    total: number;
    total_billing: number;
    total_cafe: number;
    total_pagi: number;
    total_malam: number;
    period: string
}

export default function ReportAll() {
    const [loading, setLoading] = useState<boolean>(true);
    const [selected, setSelected] = useState<string>("today");
    const [total, setTotal] = useState<SummaryReportType | null>(null);

    const getDataSummary = async (filter: string = "today") => {
        setLoading(true);
        try {
            const res = await window.api.summary_report({ period: filter });
            setLoading(false);

            if (res.status && res.data) {
                console.log("res.data", res.data)
                setTotal(res.data);
            }

        } catch (err) {
            setLoading(false);
            toast.error(`Error fetching tables: ${err}`);
        }
    }

    useEffect(() => {
        getDataSummary(selected)
    }, [selected]);

    return (
        <>
            <div className="grid gap-5">
                {
                    loading ? <LoadingComponent /> : <>
                        <ReportTitle title={`Total Transaksi (${total?.period || ""})`} setSelected={setSelected} />
                        <Card>
                            <CardBody className="p-5">
                                <div className="flex justify-between">
                                    <div className="flex flex-col gap-4">
                                        <div className="grid gap-2">
                                            <h3 className="text-xl font-bold">Total Semua</h3>
                                            <h3 className="text-xl font-bold">Rp. {convertRupiah(total?.total.toString() || "0")}</h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Diupdate pada tanggal: <b>{moment().format("DD/MM/YYYY")}</b></p>
                                    </div>
                                    <Coins />
                                </div>
                            </CardBody>
                        </Card>
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
                            <Card>
                                <CardBody className="p-5">
                                    <div className="flex justify-between">
                                        <div className="flex flex-col gap-4">
                                            <div className="grid gap-2">
                                                <h3 className="text-xl font-bold">Total Billing Billiard</h3>
                                                <h3 className="text-xl font-bold">Rp. {convertRupiah(total?.total_billing.toString() || "0")}</h3>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Diupdate pada tanggal: <b>{moment().format("DD/MM/YYYY")}</b></p>
                                        </div>
                                        <Coins />
                                    </div>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="p-5">
                                    <div className="flex justify-between">
                                        <div className="flex flex-col gap-4">
                                            <div className="grid gap-2">
                                                <h3 className="text-xl font-bold">Total Cafe</h3>
                                                <h3 className="text-xl font-bold">Rp. {convertRupiah(total?.total_cafe.toString() || "0")}</h3>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Diupdate pada tanggal: <b>{moment().format("DD/MM/YYYY")}</b></p>
                                        </div>
                                        <Utensils />
                                    </div>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="p-5">
                                    <div className="flex justify-between">
                                        <div className="flex flex-col gap-4">
                                            <div className="grid gap-2">
                                                <h3 className="text-xl font-bold">Total Shift Pagi</h3>
                                                <h3 className="text-xl font-bold">Rp. {convertRupiah(total?.total_pagi.toString() || "0")}</h3>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Diupdate pada tanggal: <b>{moment().format("DD/MM/YYYY")}</b></p>
                                        </div>
                                        <Sun />
                                    </div>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="p-5">
                                    <div className="flex justify-between">
                                        <div className="flex flex-col gap-4">
                                            <div className="grid gap-2">
                                                <h3 className="text-xl font-bold">Total Shift Malam</h3>
                                                <h3 className="text-xl font-bold">Rp. {convertRupiah(total?.total_malam.toString() || "0")}</h3>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Diupdate pada tanggal: <b>{moment().format("DD/MM/YYYY")}</b></p>
                                        </div>
                                        <Moon />
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                        <Tabs aria-label="Options">
                            <Tab key="cafe" title="Cafe">
                                <TopSaleCafe />
                            </Tab>
                            <Tab key="table" title="Table Billiard">
                                <TopSaleTable />
                            </Tab>
                        </Tabs>


                    </>
                }
            </div>
        </>
    )
}