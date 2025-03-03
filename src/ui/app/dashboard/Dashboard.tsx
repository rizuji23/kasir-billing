import { Button } from "@heroui/button";
import MainLayout from "../../components/MainLayout";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import BoxTable from "./BoxTable";
import BoxInfo from "./BoxInfo";
import HoursShift from "./HoursShift";
import { useTableBilliard } from "../../components/context/TableContext";
import { Spinner } from "@heroui/react";

export default function DashboardPage() {
    const [floor, setFloor] = useState<string>("floor_1");
    const tableList = useTableBilliard();

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
                            <HoursShift />
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

                        <BoxInfo />
                    </div>
                </div>
            </MainLayout>
        </>
    )
}