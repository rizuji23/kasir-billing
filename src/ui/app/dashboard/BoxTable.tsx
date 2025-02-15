import { Chip } from "@heroui/chip";
import { Coins, Timer } from "lucide-react";
import { useState } from "react";
import DrawerTable from "./data/DrawerTable";

export default function BoxTable() {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <div className="w-full bg-muted h-fit rounded-md p-4 cursor-pointer select-none hover:bg-muted/50 duration-300 transition-colors" onClick={() => setOpen(true)}>
                <div className="grid gap-3">
                    <div className="flex gap-3">
                        <Chip size="sm" color="success">Tersedia</Chip>
                        <Chip size="sm" color="default">Regular</Chip>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Table 01</h3>
                        <div className="mt-3">
                            <p className="text-sm">Nama Pemesan:</p>
                            <p className="text-sm font-bold">M Rizki Fauzi</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Coins className="w-4 h-4 self-center" />
                            <span className="font-medium">Rp. 20.000</span>
                        </div>
                        <div className="flex gap-2">
                            <Timer className="w-4 h-4 self-center" />
                            <span className="font-medium">01:00:20</span>
                        </div>
                    </div>
                </div>
            </div>
            <DrawerTable open={open} setOpen={setOpen} />
        </>
    )
}