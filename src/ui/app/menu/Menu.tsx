import { Card, CardBody } from "@heroui/card";
import MainLayout from "../../components/MainLayout";
import { Input } from "@heroui/input";
import { Search } from "lucide-react";
import { Divider } from "@heroui/divider";
import BoxItem from "./BoxItem";
import { Button } from "@heroui/button";
import { Tab, Tabs } from "@heroui/tabs";
import BoxMenu from "./BoxMenu";

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
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
        },
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
        },
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
        },
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
        },
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
        },
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
        },
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
        },
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
        },
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
        },
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
        },
        {
            title: "Watermelon",
            img: "/orange.jpeg",
            price: "Rp. 12.720",
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
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">Menu</h1>
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                        <div className="col-span-2">
                            <div className="flex flex-col gap-3">
                                <div className="">
                                    <Input autoFocus startContent={<Search className="w-5 h-5" />} placeholder="Cari menu disini..." />
                                </div>
                                <Tabs variant="light">
                                    <Tab key="all" title="Semua" />
                                    <Tab key="makanan" title="Makanan" />
                                    <Tab key="snack" title="Snack" />
                                    <Tab key="minuman" title="Minuman" />
                                </Tabs>
                                <Divider />
                                <div className="gap-4 grid grid-cols-2 sm:grid-cols-4 max-h-[80vh] overflow-y-auto pe-3">
                                    {list.map((item, index) => (
                                        <BoxMenu key={index} item={item} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <Card>
                                <CardBody>
                                    <div className="grid gap-3">

                                        <div className="max-h-[300px] overflow-auto pe-3">
                                            <div className="grid gap-1">
                                                {
                                                    Array.from({ length: 10 }).map((_, i) => {
                                                        return <BoxItem key={i} />
                                                    })
                                                }
                                            </div>
                                        </div>
                                        <div className="grid gap-3">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-lg font-bold">Detail Pembayaran:</h3>
                                                <p className="text-xs">Tanggal Pembelian: 20-05-2025 03:50:00</p>
                                                <Divider className="my-2" />
                                                <Input
                                                    isRequired
                                                    label="Uang Cash"
                                                    name="uang_cash"
                                                    errorMessage={"Silakan isi kolom ini."}
                                                    placeholder="Masukan uang cash disini"
                                                    type="text"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h3>Kembalian:</h3>
                                                <h1 className="text-xl font-bold">Rp. 10.000</h1>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h3>Total:</h3>
                                                <h1 className="text-xl font-bold">Rp. 10.000</h1>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Button>Pesan</Button>
                                            <Button color="danger">Batalkan</Button>
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