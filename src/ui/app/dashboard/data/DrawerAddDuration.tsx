import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Drawer, DrawerContent, DrawerFooter, } from "@heroui/drawer";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Booking, TableBilliard } from "../../../../electron/types";
import useBooking from "../../../hooks/useBooking";
import moment from "moment-timezone";
import { convertRupiah } from "../../../lib/utils";
import { Form } from "@heroui/form";
import SelectCustom from "../../../components/SelectCustom";

export default function DrawerAddDuration({ open, setOpen, table }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, table: TableBilliard }) {
    const booking = useBooking({ open, setOpen, table, add_duration: true });
    const [booking_data, setBookingData] = useState<Booking | null>(null);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        return await booking.checkOut();
    }

    useEffect(() => {
        if (open === true) {
            if (Array.isArray(table.bookings) && table.bookings.length !== 0) {
                const data = table.bookings[0];
                setBookingData(data);
                booking.setDataBooking((prevState) => ({
                    ...prevState,
                    name: data.name,
                    id_table: table.id_table,
                    id_booking: data.id_booking,
                }))
            }
        }
    }, [open]);

    return (
        <>
            <Drawer isOpen={open} onOpenChange={setOpen} size="2xl">
                <DrawerContent>
                    <Form className="!block " validationBehavior="native" onSubmit={onSubmit}>
                        <div className="grid gap-4 p-6">
                            <div className="flex flex-col gap-3">
                                <h3 className="font-bold">Tambah Durasi ({table.name})</h3>
                                <Divider />
                            </div>
                            <div className="grid gap-2">
                                <span className="text-sm font-semibold">Informasi Pemesan:</span>
                                <div className="p-3 bg-default-100 rounded-md grid gap-2">
                                    <div className="">
                                        <small>Nama Pemesan:</small>
                                        <p className="text-sm font-bold">{booking_data?.name || "-"}</p>
                                    </div>
                                    <div className="">
                                        <small>Total Durasi:</small>
                                        <p className="text-sm font-bold">{booking_data?.duration || "0"} Jam</p>
                                    </div>
                                    <div className="">
                                        <small>Total: </small>
                                        <p className="text-sm font-bold">Rp. {convertRupiah(booking_data?.total_price.toString() || "0")}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="grid gap-4">
                                    <SelectCustom label="Pilih Tipe Harga" value={booking.data_booking.type_price} onChange={(e) => booking.setDataBooking((prevState) => ({
                                        ...prevState,
                                        type_price: e.target.value
                                    }))}>
                                        {
                                            booking.type_price.map((el) => {
                                                return <SelectCustom.Option value={el.type_price} key={el.type_price}>{el.type_price}</SelectCustom.Option>
                                            })
                                        }

                                    </SelectCustom>
                                    <Input
                                        isRequired
                                        label="Durasi (Per Jam)"
                                        name="username"
                                        errorMessage={"Silakan isi kolom ini."}
                                        placeholder="Masukan durasi disini"
                                        type="number"
                                        value={booking.data_booking.duration}
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
                                    {
                                        booking.data_booking.type_play !== "LOSS" && (
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
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                        <DrawerFooter className="">
                            <div className="flex flex-col gap-3 w-full">
                                <div className="grid gap-2">
                                    <div className="p-3 border-2 rounded-md grid gap-1">
                                        {
                                            booking.data_booking.type_play !== "LOSS" && (
                                                <>
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
                                                </>
                                            )
                                        }
                                        <div className="flex gap-3">
                                            <p className="text-sm font-bold">Total: Rp. {convertRupiah(booking.subtotal.toString())}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button color="primary" type="submit">
                                        Tambah Durasi
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