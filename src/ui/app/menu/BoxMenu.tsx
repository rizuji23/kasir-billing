import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { IMenu } from "../../../electron/types";
import { convertRupiah } from "../../lib/utils";
import { UseCartResult } from "../../hooks/useCart";

export default function BoxMenu({ item, cart }: { item: IMenu, cart: UseCartResult }) {
    return (
        <>
            <Card isPressable shadow="sm" onPress={() => cart.addToCart({ id: item.id || 0, name: item.name, price: item.price, qty: "1", subtotal: item.price })}>
                <CardBody className="overflow-visible">
                    <div className="grid gap-2">
                        <div className="flex-col text-small justify-between">
                            <b>{item.name}</b>
                            <p className="text-default-500 font-semibold">Rp. {convertRupiah(item.price.toString())}</p>
                        </div>
                        <div className="flex justify-end">
                            <Chip size="sm">{item.category_menu?.name || "-"}</Chip>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}