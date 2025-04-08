import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Trash } from "lucide-react";
import { ICart } from "../../../electron/types";
import { UseCartResult } from "../../hooks/useCart";
import { convertRupiah } from "../../lib/utils";
import InputQty from "../../components/InputQty";

export default function BoxItem({ item, cart }: { item: ICart, cart: UseCartResult }) {
    return (
        <>
            <div className="flex justify-between">
                <div className="p-3 flex gap-3 justify-between">
                    <div className="grid gap-1">
                        <p className="font-bold text-sm">{item.name}</p>
                        <div>
                            <p className="text-sm">Rp. {convertRupiah(item.price.toString())}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 self-center">
                    <InputQty onPressMinus={() => cart.updateQuantity(item.id, "decrease")} onPressPlus={() => cart.updateQuantity(item.id, "increase")} value={item.qty} />

                    <Button isIconOnly size="sm" onPress={() => cart.removeFromCart(item.id)} color="danger"><Trash className="w-5 h-5" /></Button>
                </div>
            </div>
            <Divider />
        </>
    )
}