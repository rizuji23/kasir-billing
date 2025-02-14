import { Card, CardBody, CardFooter } from "@heroui/card";
import MainLayout from "../../components/MainLayout";
import { Input } from "@heroui/input";
import { Image } from "@heroui/image";
import { Search } from "lucide-react";
import { Divider } from "@heroui/divider";
import BoxItem from "./BoxItem";

export default function Menu() {
    const list: { title: string, img: string, price: string }[] = [
        {
            title: "Orange",
            img: "/orange.jpeg",
            price: "Rp. 5.550",
        },
        {
            title: "Tangerine",
            img: "/orange.jpeg",
            price: "Rp. 3.300",
        },
        {
            title: "Raspberry",
            img: "/orange.jpeg",
            price: "Rp. 10.400",
        },
        {
            title: "Lemon",
            img: "/orange.jpeg",
            price: "Rp. 5.230",
        },
        {
            title: "Avocado",
            img: "/orange.jpeg",
            price: "Rp. 15.170",
        },
        {
            title: "Lemon 2",
            img: "/orange.jpeg",
            price: "Rp. 8.300",
        },
        {
            title: "Banana",
            img: "/orange.jpeg",
            price: "Rp. 7.650",
        },
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
        },
    ];


    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-8">
                    <div className="flex justify-between">
                        <h1 className="text-3xl font-bold">Menu</h1>
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                        <div className="col-span-2">
                            <div className="flex flex-col gap-3">
                                <div className="max-w-[300px]">
                                    <Input autoFocus startContent={<Search className="w-5 h-5" />} placeholder="Cari menu disini..." />
                                </div>
                                <div className="gap-4 grid grid-cols-2 sm:grid-cols-4">
                                    {list.map((item, index) => (
                                        /* eslint-disable no-console */
                                        <Card key={index} isPressable shadow="sm" onPress={() => console.log("item pressed")}>
                                            <CardBody className="overflow-visible p-0">
                                                <Image
                                                    alt={item.title}
                                                    className="w-full object-cover h-[140px]"
                                                    radius="lg"
                                                    shadow="sm"
                                                    src={item.img}
                                                    width="100%"
                                                />
                                            </CardBody>
                                            <CardFooter className="text-small justify-between">
                                                <b>{item.title}</b>
                                                <p className="text-default-500">{item.price}</p>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <Card>
                                <CardBody>
                                    <div className="grid gap-3">
                                        <div>
                                            <p className="!text-center font-bold text-lg">Detail Pesanan</p>
                                        </div>
                                        <Divider />
                                        <div className="max-h-[400px] overflow-auto pe-3">
                                            <div className="grid gap-1">
                                                {
                                                    Array.from({ length: 10 }).map((_, i) => {
                                                        return <BoxItem key={i} />
                                                    })
                                                }
                                            </div>
                                        </div>
                                        <div>

                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </div>
            </MainLayout>
        </>
    )
}