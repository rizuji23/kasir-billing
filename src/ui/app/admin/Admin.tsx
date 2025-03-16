import MainLayout from "../../components/MainLayout";
import { Tabs, Tab } from "@heroui/tabs";
import UserList from "./section/UserList";
import PriceList from "./section/PriceList";
import ShiftList from "./section/ShiftList";

export default function AdminPage() {
    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">Pengaturan Admin</h1>
                    </div>

                    <Tabs aria-label="Options">
                        <Tab key="user" title="User">
                            <UserList />
                        </Tab>
                        <Tab key="music" title="Harga">
                            <PriceList />
                        </Tab>
                        <Tab key="shift" title="Shift">
                            <ShiftList />
                        </Tab>
                    </Tabs>
                </div>
            </MainLayout>
        </>
    )
}