import { Tabs, Tab } from "@heroui/tabs";
import UserList from "./section/UserList";
import PriceList from "./section/PriceList";
import ShiftList from "./section/ShiftList";
import { Button } from "@heroui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import PaketAdmin from "./section/Paket";

export default function AdminPage() {
    const history = useNavigate();

    return (
        <>
            <div className="container mx-auto mt-4">
                <div className="flex flex-col gap-5">
                    <div className="flex gap-3">
                        <Button onPress={() => history("/")} isIconOnly ><ChevronLeft /></Button>
                        <h1 className="text-2xl font-bold">Pengaturan Tambahan</h1>
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
                        <Tab key={"paket"} title="Paket">
                            <PaketAdmin />
                        </Tab>
                    </Tabs>
                </div>
            </div>

        </>
    )
}