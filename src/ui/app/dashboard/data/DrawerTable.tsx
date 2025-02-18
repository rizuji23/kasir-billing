import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, } from "@heroui/drawer";
import { Input } from "@heroui/input";
import { Radio, RadioGroup } from "@heroui/radio";
import { Select, SelectItem } from "@heroui/select";
import { BadgePercent, Coins } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export default function DrawerTable({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    return (
        <>
            <Drawer isOpen={open} onOpenChange={setOpen}>
                <DrawerContent>
                    <DrawerHeader className="flex flex-col gap-1">Table 01</DrawerHeader>
                    <DrawerBody>
                        <div className="grid gap-4">
                            <Card>
                                <CardHeader className="font-bold">Booking Detail</CardHeader>
                                <CardBody>
                                    <div className="grid gap-4">
                                        <RadioGroup orientation="horizontal" size="sm" label="Pilih Mode" classNames={{
                                            label: "text-sm"
                                        }} defaultValue={"regular"}>
                                            <Radio value="regular">Regular</Radio>
                                            <Radio value="loss">Loss</Radio>
                                        </RadioGroup>
                                        <div>
                                            <Input
                                                isRequired
                                                label="Nama Lengkap"
                                                name="full_name"
                                                errorMessage={"Silakan isi kolom ini."}
                                                placeholder="Masukan nama lengkap disini"
                                                type="text"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardHeader className="font-bold">Detail Pesanan</CardHeader>
                                <CardBody>
                                    <div className="grid gap-4">
                                        <Select label="Pilih Tipe Harga" isRequired defaultSelectedKeys={"regular"}>
                                            <SelectItem key={"regular"}>Regular</SelectItem>
                                            <SelectItem key={"vip"}>VIP</SelectItem>
                                        </Select>
                                        <Input
                                            isRequired
                                            label="Durasi (Per Jam)"
                                            name="username"
                                            errorMessage={"Silakan isi kolom ini."}
                                            placeholder="Masukan durasi disini"
                                            type="text"
                                        />
                                        <Divider />
                                        <div className="grid gap-2">
                                            <span className="text-sm font-semibold">Detail Harga:</span>
                                            <div className="p-3 border-2 rounded-md">
                                                <ol className="list-decimal pl-5 max-h-[100px] overflow-auto">
                                                    <li className="text-sm font-medium">19:00:00 = Rp. 30.000</li>
                                                    <li className="text-sm font-medium">19:00:00 = Rp. 30.000</li>
                                                    <li className="text-sm font-medium">19:00:00 = Rp. 30.000</li>

                                                </ol>
                                            </div>
                                        </div>
                                        <div>
                                            <Input
                                                label="Voucher"
                                                name="username"
                                                errorMessage={"Silakan isi kolom ini."}
                                                placeholder="Masukan voucher disini"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </DrawerBody>
                    <DrawerFooter>
                        <div className="flex flex-col gap-3 w-full">
                            <div className="grid gap-2">
                                <div className="p-3 border-2 rounded-md grid gap-1">
                                    <div className="flex gap-3">
                                        <Coins className="w-4 h-4 self-center" />
                                        <span className="font-bold text-sm">Rp. 100.000</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <BadgePercent className="w-4 h-4 self-center" />
                                        <span className="font-bold text-sm">0%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button color="primary" >
                                    Booking Sekarang
                                </Button>
                            </div>
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    )
}