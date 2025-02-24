import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Minus, Plus, Trash } from "lucide-react";
import { ICart } from "../../../electron/types";
import { UseCartResult } from "../../hooks/useCart";
import { convertRupiah } from "../../lib/utils";
import { Input } from "@heroui/input";

export default function BoxItem({ item, cart }: { item: ICart, cart: UseCartResult }) {
    return (
        <>
            <div className="flex justify-between">
                <div className="p-3 flex gap-3">
                    <div className="grid gap-1">
                        <p className="font-bold">{item.name}</p>
                        <div>
                            <p className="">Rp. {convertRupiah(item.price.toString())}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 self-center">
                    <Input
                        size="sm"
                        className="max-w-[100px]"
                        classNames={{ inputWrapper: "!px-0 !text-center", input: "!text-center" }}
                        value={item.qty}

                        startContent={
                            <Button
                                size="sm"
                                color="success"
                                isIconOnly
                                onPress={() => cart.updateQuantity(item.id, "decrease")}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                        }
                        endContent={
                            <Button
                                size="sm"
                                color="success"
                                isIconOnly
                                onPress={() => cart.updateQuantity(item.id, "increase")}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        }
                        readOnly
                    />
                    <Button isIconOnly size="sm" onPress={() => cart.removeFromCart(item.id)} color="danger"><Trash className="w-5 h-5" /></Button>
                </div>
            </div>
            <Divider />
        </>
    )
}