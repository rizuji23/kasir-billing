import { Chip } from "@heroui/chip";
import { Coins, Timer } from "lucide-react";
import { useState } from "react";
import DrawerTable from "./data/DrawerTable";
import { TableBilliard } from "../../../electron/types";
import { convertRupiah } from "../../lib/utils";
import moment from "moment-timezone";

export default function BoxTable(props: TableBilliard) {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <div className="w-full bg-muted h-fit rounded-md p-4 cursor-pointer select-none hover:bg-muted/50 duration-300 transition-colors" onClick={() => setOpen(true)}>
                <div className="grid gap-3">
                    <div className="flex gap-3">
                        {
                            props.status === "AVAILABLE" ? <Chip size="sm" color="success">Tersedia</Chip> : <Chip size="sm" color="danger">Terpakai</Chip>
                        }
                        {
                            props.type_play === "REGULAR" ? <Chip size="sm" color="default">Regular</Chip> : props.type_play === "LOSS" ? <Chip size="sm" classNames={{ base: "bg-blue-500" }} color="default">Loss</Chip> : <></>
                        }

                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{props.name}</h3>
                        <div className="mt-3">
                            <p className="text-sm">Nama Pemesan:</p>
                            <p className="text-sm font-bold">{Array.isArray(props.bookings) ? props.bookings.length > 0 ? props.bookings[0].name : "-" : "-"}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Coins className="w-4 h-4 self-center" />
                            <span className="font-medium">Rp. {Array.isArray(props.bookings) ? props.bookings.length > 0 ? convertRupiah(props.bookings[0].total_price.toString()) : "0" : "0"}</span>
                        </div>
                        <div className="flex gap-2">
                            <Timer className="w-4 h-4 self-center" />
                            <span className="font-medium">{props.remainingTime}</span>
                        </div>
                    </div>
                </div>
            </div>
            <DrawerTable open={open} setOpen={setOpen} table={props} />
        </>
    )
}