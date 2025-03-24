import MainLayout from "../../components/MainLayout";
import BoxTable from "./BoxTable";
import HoursShift from "./HoursShift";
import { useTableBilliard } from "../../components/context/TableContext";
import { Chip, Spinner } from "@heroui/react";
import { useWebsocketData } from "../../components/context/WebsocketContext";

export default function DashboardPage() {
    const tableList = useTableBilliard();
    const websocket = useWebsocketData();

    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                        <div className="flex justify-between">
                            <div className="self-center">
                                <h1 className="text-3xl font-bold">Meja Billiard</h1>
                            </div>
                            <div className="flex gap-3 mr-14 -mt-2">
                                <HoursShift />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Chip classNames={{ content: "font-bold" }}>Booking Aktif: {tableList.total.used}/{tableList.total.all}</Chip>
                        </div>
                    </div>

                    <div className="flex gap-5">
                        <div className="w-full">
                            {
                                tableList.loading ? <div className="flex justify-center h-[20vh]">
                                    <Spinner size="lg" />
                                </div> : <div className="grid grid-cols-5 gap-5">
                                    {
                                        tableList.tableList.map((el, i) => {
                                            return <BoxTable key={i} {...el} />
                                        })
                                    }
                                </div>
                            }
                        </div>
                    </div>

                    {
                        websocket.tableRemote.map((el, i) => {
                            return <div className="grid gap-3 mt-10" key={i}>
                                <div className="flex justify-between">
                                    <div className="self-center">
                                        <h1 className="text-3xl font-bold">{el.name}</h1>
                                    </div>
                                </div>
                                <div className="flex gap-5">
                                    <div className="w-full">
                                        <div className="grid grid-cols-5 gap-5">
                                            {
                                                el.data.map((table, table_i) => {
                                                    return <BoxTable key={table_i} {...table} is_remote={true} />
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        })
                    }
                </div>
            </MainLayout>
        </>
    )
}