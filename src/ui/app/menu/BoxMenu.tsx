import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";

export default function BoxMenu({ item }: { item: { title: string, img: string, price: string } }) {
    return (
        <>
            <Card isPressable shadow="sm" onPress={() => console.log("item pressed")}>
                <CardBody className="overflow-visible">
                    <div className="grid gap-2">
                        <div className="flex text-small justify-between">
                            <b>{item.title}</b>
                            <p className="text-default-500">{item.price}</p>
                        </div>
                        <div className="flex justify-end">
                            <Chip size="sm">Minuman</Chip>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}