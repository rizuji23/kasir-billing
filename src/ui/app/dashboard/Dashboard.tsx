import { Button } from "@heroui/button";
import MainLayout from "../../components/MainLayout";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import BoxTable from "./BoxTable";
import BoxInfo from "./BoxInfo";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { IResponses } from "../../../electron/lib/responses";
import { TableBilliard } from "../../../electron/types";
import { toast } from "sonner";

export default function DashboardPage() {
    const [floor, setFloor] = useState<string>("floor_1");
    const [table_list, setTableList] = useState<TableBilliard[]>([]);

    const getTables = async () => {
        try {
            const res: IResponses<TableBilliard[]> = await window.api.table_list();

            if (res.status && res.data) {
                setTableList(res.data);
            } else {
                toast.error(`Failed to fetch table list: ${res.detail_message}`);
            }
        } catch (err) {
            toast.error(`Error fetching tables: ${err}`);
        }
    };

    useEffect(() => {
        if (floor === "floor_1") {
            getTables();
        }
    }, [floor])

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
                            <div className="self-center">
                                <Chip size="lg" classNames={{
                                    content: "font-bold"
                                }}>01:00:20</Chip>
                            </div>
                            <div className="self-center">
                                <Chip size="lg" color="success"><span>Shift: </span><span className="font-bold">Malam</span></Chip>
                            </div>
                            <Divider orientation="vertical" />
                            <Button isIconOnly color="primary">
                                <RefreshCw className="w-5 h-5" />
                            </Button>
                            <Button color="warning">
                                Lanjutkan Timer
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-5">
                        <div className="w-full">
                            <div className="grid grid-cols-5 gap-5">
                                {
                                    table_list.map((el, i) => {
                                        return <BoxTable key={i} {...el} />
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