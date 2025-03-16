import { Chip } from "@heroui/chip";
import { Coins, Timer } from "lucide-react";
import { useState } from "react";
import DrawerTable from "./data/DrawerTable";
import { TableBilliard } from "../../../electron/types";
import { convertRupiah } from "../../lib/utils";
import DrawerBookingTable from "./data/DrawerBookingTable";
import { Button } from "@heroui/button";
import DrawerAddDuration from "./data/DrawerAddDuration";
import DrawerCafeTable from "./data/DrawerCafeTable";

interface BoxTableProps extends TableBilliard {
    is_remote?: boolean
}

export default function BoxTable({ is_remote = false, ...props }: BoxTableProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [open_duration, setOpenDuration] = useState<boolean>(false);
    const [open_cafe, setOpenCafe] = useState<boolean>(false);

    return (
        <>
            <div className="w-full bg-muted h-fit rounded-md cursor-pointer select-none hover:bg-muted/50 duration-300 transition-colors" onClick={() => {
                if (!is_remote) {
                    setOpen(true)
                }
            }}>
                <div className="grid gap-3 px-4 pt-4 pb-1">
                    <div className="flex gap-3">
                        {
                            props.status === "AVAILABLE" ? <Chip size="sm" color="success">Tersedia</Chip> : props.status === "MOSTLYEXPIRE" ? <Chip size="sm" color="warning">Hampir Habis</Chip> : props.status === "USED" ? <Chip size="sm" classNames={{ base: "bg-[#9353D3]" }} >Terpakai</Chip> : <Chip size="sm" color="danger">Habis</Chip>
                        }
                        {
                            props.type_play === "REGULAR" ? <Chip size="sm" color="default">Regular</Chip> : props.type_play === "LOSS" ? <Chip size="sm" classNames={{ base: "bg-blue-500" }} color="default">Loss</Chip> : <></>
                        }

                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{props.name}</h3>
                        <div className="mt-3">
                            <p className="text-sm">Nama Pemesan:</p>
                            <p className="text-sm font-bold">{props.status !== "AVAILABLE" ? Array.isArray(props.bookings) ? props.bookings.length > 0 ? props.bookings[0].name : "-" : "-" : "-"}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 pb-3">
                        <div className="flex gap-2">
                            <Coins className="w-4 h-4 self-center" />
                            <span className="font-medium">Rp. {props.status !== "AVAILABLE" ? Array.isArray(props.bookings) ? props.bookings.length > 0 ? convertRupiah(props.bookings[0].total_price.toString()) : "0" : "0" : "0"}</span>
                        </div>
                        <div className="flex gap-2">
                            <Timer className="w-4 h-4 self-center" />
                            <span className="font-medium">{props.remainingTime}</span>
                        </div>
                    </div>

                </div>
                {
                    !is_remote ?
                        props.status !== "AVAILABLE" ? (props?.bookings || []).length !== 0 && (
                            <div className="flex gap-3 p-2">
                                {
                                    props.status === "EXPIRE" || props.status === "MOSTLYEXPIRE" ? <Button onPress={() => setOpenDuration(true)} className="flex-1" size="sm">Durasi</Button> : <></>
                                }
                                <Button onPress={() => setOpenCafe(true)} className="flex-1" color="warning" size="sm">Cafe</Button>
                            </div>
                        ) : <></> : <></>
                }
            </div>
            {
                props.status === "AVAILABLE" ? <DrawerTable open={open} setOpen={setOpen} table={props} /> : <DrawerBookingTable open={open} setOpen={setOpen} table={props} />
            }
            <DrawerAddDuration open={open_duration} setOpen={setOpenDuration} table={props} />
            <DrawerCafeTable open={open_cafe} setOpen={setOpenCafe} table={props} />
        </>
    )
}