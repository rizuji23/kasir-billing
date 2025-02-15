import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Pencil, Trash } from "lucide-react";

export default function BoxItem() {
    return (
        <>
            <div className="flex justify-between">
                <div className="p-3 flex gap-3">
                    <div className="grid gap-1">
                        <p className="font-bold">Orange Jus</p>
                        <div>
                            <p className="text-sm">Rp. 20.000</p>
                            <p className="text-sm">Qty: 10</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 self-center">
                    <Button isIconOnly size="sm"><Pencil className="w-5 h-5" /></Button>
                    <Button isIconOnly size="sm" color="danger"><Trash className="w-5 h-5" /></Button>
                </div>
            </div>
            <Divider />
        </>
    )
}