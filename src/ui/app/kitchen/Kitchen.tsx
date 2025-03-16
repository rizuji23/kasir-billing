import MainLayout from "../../components/MainLayout";
import { Tabs, Tab } from "@heroui/tabs";

export default function KitchenPage() {
    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">Dapur</h1>
                    </div>
                    <Tabs aria-label="Options">
                        <Tab key="all" title="Semua" />
                        <Tab key="pending" title="Pending" />
                        <Tab key="done" title="Selesai" />
                    </Tabs>
                </div>
            </MainLayout>
        </>
    )
}