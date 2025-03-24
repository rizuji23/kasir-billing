import { Bell } from "lucide-react";
import { Badge } from "@heroui/badge";
import { Popover, PopoverTrigger, PopoverContent, Divider, Button } from "@heroui/react";
import NotFound from "../NotFound";
import { useWebsocketData } from "../context/WebsocketContext";

export default function NotificationTray() {
    const chat = useWebsocketData();

    return <>
        <Badge color="danger" shape="circle" content={chat.chat.length}>
            <Popover placement="bottom">
                <PopoverTrigger>
                    <Button isIconOnly startContent={<Bell className="w-4 h-4" />}></Button>
                </PopoverTrigger>
                <PopoverContent className="max-w-[300px] min-w-[300px] p-0">
                    <div className="grid gap-1 w-full">
                        <div className="px-3 py-2">
                            <div className="text-small font-bold">Notifikasi</div>
                        </div>
                        <Divider />
                        <div className="px-3 py-2 w-full">
                            <NotFound classNameImage="w-[50px]" classNameText="text-sm" title="Notifikasi Kosong" />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

        </Badge>
    </>
}