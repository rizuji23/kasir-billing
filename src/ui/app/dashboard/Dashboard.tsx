import { Button } from "@heroui/button";
import MainLayout from "../../components/MainLayout";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import BoxTable from "./BoxTable";
import BoxInfo from "./BoxInfo";

export default function DashboardPage() {
    const [floor, setFloor] = useState<string>("floor_1")

    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-8">
                    <div className="flex justify-between">
                        <div className="self-center">
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button className="text-2xl font-bold" endContent={<ChevronDown className="w-5 h-5 self-center" />}>
                                        {
                                            floor === "floor_1" ? "Lantai 1" : "Lantai 2"
                                        }
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu onAction={(e) => setFloor(e.toString())} selectedKeys={floor}>
                                    <DropdownItem value={"floor_1"} key="floor_1">Lantai 1</DropdownItem>
                                    <DropdownItem value={"floor_2"} key="floor_2">Lantai 2</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>

                        </div>
                        <div className="flex gap-3">
                            <Button isIconOnly color="primary">
                                <RefreshCw />
                            </Button>
                            <Button>
                                Lanjutkan Timer
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-5">
                        <div className="w-full">
                            <div className="grid grid-cols-5 gap-5">
                                {
                                    Array.from({ length: 10 }).map((_, i) => {
                                        return <BoxTable key={i} />
                                    })
                                }
                            </div>
                        </div>

                        <BoxInfo />
                    </div>
                </div>
            </MainLayout>
        </>
    )
}