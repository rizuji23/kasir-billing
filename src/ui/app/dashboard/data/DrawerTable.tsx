import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Drawer, DrawerContent, DrawerFooter, } from "@heroui/drawer";
import { Input } from "@heroui/input";
import { Radio, RadioGroup } from "@heroui/radio";
import { Select, SelectItem } from "@heroui/select";
import { BadgePercent, Coins, Timer } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { TableBilliard } from "../../../../electron/types";
import useBooking from "../../../hooks/useBooking";
import moment from "moment-timezone";
import { convertRupiah } from "../../../lib/utils";
import { Form } from "@heroui/form";

export default function DrawerTable({ open, setOpen, table }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, table: TableBilliard }) {
    const booking = useBooking({ open, setOpen })


    return (
        <>
            <Drawer isOpen={open} onOpenChange={setOpen} size="2xl">
                <DrawerContent>
                    <Form className="!block " validationBehavior="native">
                        <div className="grid gap-4 p-6">
                            <div className="flex flex-col gap-3">
                                <h3 className="font-bold">Booking Detail ({table.name})</h3>
                                <Divider />
                                <div className="grid gap-4">
                                    <RadioGroup orientation="horizontal" size="sm" label="Pilih Mode" classNames={{
                                        label: "text-sm"
                                    }} value={booking.data_booking.type_play} onValueChange={(e) => booking.setDataBooking((prevState) => ({
                                        ...prevState,
                                        type_play: e
                                    }))}>
                                        <Radio value="REGULAR">Regular</Radio>
                                        <Radio value="LOSS">Loss</Radio>
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
                            </div>
                            <Divider />
                            <div className="flex flex-col gap-3">
                                <h3 className="font-bold">Detail Pesanan</h3>
                                <div className="grid gap-4">
                                    <Select label="Pilih Tipe Harga" isRequired selectedKeys={[booking.data_booking.type_price]} onChange={(e) => booking.setDataBooking((prevState) => ({
                                        ...prevState,
                                        type_price: e.target.value
                                    }))}>
                                        {
                                            booking.type_price.map((el) => {
                                                return <SelectItem key={el.type_price}>{el.type_price}</SelectItem>
                                            })
                                        }

                                    </Select>
                                    <Input
                                        isRequired
                                        label="Durasi (Per Jam)"
                                        name="username"
                                        errorMessage={"Silakan isi kolom ini."}
                                        placeholder="Masukan durasi disini"
                                        type="number"
                                        isDisabled={booking.data_booking.type_play === "LOSS"}
                                        onChange={(e) => {
                                            booking.setDataBooking((prevState) => ({
                                                ...prevState,
                                                duration: e.target.value
                                            }));

                                            booking.handleItemPrice(e.target.value);
                                        }}
                                    />
                                    {
                                        booking.data_booking.type_play !== "LOSS" && (
                                            <div className="grid gap-2">
                                                <span className="text-sm font-semibold">Detail Item:</span>
                                                <div className="p-3 border-2 rounded-md">
                                                    <ol className="list-decimal pl-5 max-h-[100px] overflow-auto">
                                                        {
                                                            booking.item_price.length === 0 ? <h3 className="text-center font-bold py-2">Item Tidak Ditemukan</h3> :
                                                                booking.item_price.map((el, i) => {
                                                                    return <li className="text-sm font-medium" key={i}><b>({moment(el.start_duration).format("HH:mm:ss") + " - " + moment(el.end_duration).format("HH:mm:ss")})</b> = Rp. {convertRupiah(el.price.toString())}</li>
                                                                })
                                                        }


                                                    </ol>
                                                </div>
                                            </div>
                                        )
                                    }
                                    <Divider />
                                    <Select
                                        label="Lampu Blink"
                                        placeholder="Pilih jawaban..."
                                        onChange={(e) => booking.setDataBooking((prevState) => ({
                                            ...prevState,
                                            blink: e.target.value
                                        }))}
                                        selectedKeys={[booking.data_booking.blink]}
                                    >
                                        <SelectItem key={"iya"}>Iya</SelectItem>
                                        <SelectItem key={"tidak"}>Tidak</SelectItem>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DrawerFooter className="">
                            <div className="flex flex-col gap-3 w-full">
                                <div className="grid gap-2">
                                    <div className="p-3 border-2 rounded-md grid gap-1">
                                        <div className="flex gap-3">
                                            <p className="text-sm font-bold">Waktu Mulai: {booking.item_price.length !== 0 ? moment(booking.item_price[0].start_duration).format("HH:mm:ss") : "00:00:00"}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <p className="text-sm font-bold">Waktu Berakhir: {booking.item_price.length !== 0 ? moment(booking.item_price[booking.item_price.length - 1].end_duration).format("HH:mm:ss") : "00:00:00"}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <p className="text-sm font-bold">Durasi: {booking.item_price.length} Jam</p>
                                        </div>
                                        <Divider className="my-3" />
                                        <div className="flex gap-3">
                                            <p className="text-sm font-bold">Total: Rp. {convertRupiah(booking.subtotal.toString())}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button color="primary" type="submit">
                                        Booking Sekarang
                                    </Button>
                                </div>
                            </div>
                        </DrawerFooter>
                    </Form>
                </DrawerContent>
            </Drawer>
        </>
    )
}