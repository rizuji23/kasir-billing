import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Booking, TableBilliard } from "../../../../electron/types";
import { Drawer, DrawerContent } from "@heroui/drawer";
import { Form } from "@heroui/form";
import { Divider } from "@heroui/divider";
import { Select as HeroSelect, Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { ArrowBigDown, Banknote, Check, Printer, RefreshCcw, X } from "lucide-react";
import { toast } from "sonner";
import NotFound from "../../../components/NotFound";
import moment from "moment-timezone";
import { Input } from "@heroui/input";
import { Checkbox, Chip, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { convertRupiah } from "../../../lib/utils";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from "@heroui/table";


export default function DrawerBookingTable({ open, setOpen, table }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, table: TableBilliard }) {
    const [detail, setDetail] = useState<{
        table: TableBilliard,
        booking: Booking,
    } | null>(null);

    const [editName, setEditName] = useState<boolean>(false);
    const [name, setName] = useState<string>("");

    const getDetailBookingTable = async () => {
        try {
            const res = await window.api.detail_booking(table.id_table);

            if (res.status && res.data) {
                console.log(res.data);
                setDetail(res.data);
                setName(res.data.booking.name);
            }
        } catch (err) {
            toast.error(`Error getting getDetailBookingTable: ${err}`);
        }
    }

    const handleChangeName = async () => {
        try {
            const res = await window.api.change_name({ id_booking: detail?.booking.id_booking || "", name: name });

            if (res.status) {
                toast.success("Nama berhasil diubah");
                setEditName(false);
                setName(res.data?.name || "");
            }
        } catch (err) {
            toast.error(`Error handleChangeName: ${err}`);
        }
    }

    useEffect(() => {
        if (open === true) {
            getDetailBookingTable();
        }
    }, [open]);

    return (
        <Drawer isOpen={open} onOpenChange={setOpen} size="full">
            <DrawerContent>
                {
                    !detail ? <NotFound /> : <Form className="!block " validationBehavior="native">
                        <div className="grid gap-4 p-6">
                            <div className="flex flex-col gap-3">
                                <h3 className="font-bold">Detail Pembayaran ({table.name})</h3>
                                <Divider />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="grid gap-3">
                                        <div className="p-3 border-3 rounded-md flex justify-start gap-3">
                                            <Button startContent={<RefreshCcw className="w-4 h-4" />}>Reset Meja</Button>
                                            <Button startContent={<Printer className="w-4 h-4" />}>Print Struk Billing</Button>
                                            <Popover placement="bottom" showArrow={true}>
                                                <PopoverTrigger>
                                                    <Button startContent={<ArrowBigDown className="w-4 h-4" />}>Pindah Meja</Button>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <div className="px-1 py-2 w-[300px] flex flex-col gap-3">
                                                        <Select label="Pilih Meja" placeholder="Pilih meja...">
                                                            <SelectItem></SelectItem>
                                                        </Select>
                                                        <Button color="success" size="sm" className="w-full">Pindah Meja</Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                        </div>
                                        <div className="grid gap-2">
                                            <span className="text-sm font-semibold">Informasi Pemesan:</span>
                                            <div className="p-3 bg-default-100 rounded-md grid gap-2">
                                                <div className="">
                                                    <small>Nama Pemesan:</small>
                                                    <div className="flex gap-3">
                                                        <p className="text-sm font-bold">{editName ? <Input variant="bordered" className="w-[200px]" value={name} onChange={(e) => setName(e.target.value)} /> : name}</p>

                                                        {
                                                            editName ? <div className="flex gap-2 self-center">
                                                                <Button isIconOnly size="sm" color="success" onPress={handleChangeName}><Check className="w-4 h-4" /></Button>
                                                                <Button isIconOnly size="sm" onPress={() => {
                                                                    setEditName(false)
                                                                    setName(detail.booking.name);
                                                                }} color="danger"><X className="w-4 h-4" /></Button>
                                                            </div> : <>
                                                                <span className="text-sm font-bold self-center">|</span><button className="font-normal text-sm text-blue-500 hover:underline" onClick={() => setEditName(true)} type="button">Edit</button>
                                                            </>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <small>Tipe Mode:</small>
                                                    <p className="text-sm font-bold">{detail.table.type_play}</p>
                                                </div>
                                                <div className="">
                                                    <small>Blink:</small>
                                                    <p className="text-sm font-bold">{detail.table.blink === true ? "Iya" : "Tidak"}</p>
                                                </div>
                                                <div className="">
                                                    <small>Waktu Order:</small>
                                                    <p className="text-sm font-bold">{moment(detail.booking.created_at).format("DD/MM/YYYY HH:mm:ss")}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <span className="text-sm font-semibold">Informasi Pesanan:</span>
                                            <div className="p-3 bg-default-100 rounded-md grid gap-2">
                                                <div className="">
                                                    <small>Total Durasi</small>
                                                    <p className="text-sm font-bold">{detail.booking.duration} Jam</p>
                                                </div>
                                                <div className="">
                                                    <small>Total Harga Menu</small>
                                                    <p className="text-sm font-bold">Rp. </p>
                                                </div>
                                                <div className="">
                                                    <small>Total Harga Billing</small>
                                                    <p className="text-sm font-bold">Rp. {convertRupiah(detail.booking.total_price.toString() || "0")}</p>
                                                </div>
                                                <Divider />
                                                <div className="">
                                                    <small>Total Semua</small>
                                                    <p className=" font-bold">Rp. </p>
                                                </div>
                                                <Divider />
                                                <div className="">
                                                    <small>Uang Cash</small>
                                                    <Input variant="bordered" autoFocus startContent={"Rp. "} />
                                                </div>
                                                <Divider />
                                                <div className="">
                                                    <small>Kembalian</small>
                                                    <p className=" font-bold">Rp. </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end">
                                            <Button variant="bordered" color="danger" onPress={() => setOpen(false)}>Kembali</Button>
                                            <Button color="success" startContent={<Banknote className="w-4 h-4" />}>Bayar Sekarang</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 border-3 rounded-md flex flex-col gap-3 h-fit">
                                    <div className="flex flex-col gap-3">
                                        <h3 className="font-bold">Detail Pesanan</h3>
                                        <Divider />
                                        <div className="grid gap-2">
                                            <p className="font-bold text-sm">List Billing: </p>
                                            <div className="grid gap-3 mt-3">
                                                <Table aria-label="Example static collection table" selectionMode="multiple">
                                                    <TableHeader>
                                                        <TableColumn>Jam Mulai</TableColumn>
                                                        <TableColumn>Jam Berakhir</TableColumn>
                                                        <TableColumn>Harga</TableColumn>
                                                        <TableColumn>Status</TableColumn>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {
                                                            Array.isArray(detail.booking.detail_booking) && detail.booking.detail_booking.length !== 0 ? detail.booking.detail_booking.map((el) => {
                                                                return <TableRow key={el.id}>
                                                                    <TableCell>{moment(el.start_duration).format("HH:mm:ss")}</TableCell>
                                                                    <TableCell>{moment(el.end_duration).format("HH:mm:ss")}</TableCell>
                                                                    <TableCell>Rp. {convertRupiah(el.price.toString() || "0")}</TableCell>
                                                                    <TableCell>
                                                                        <Chip color={el.status === "PAID" ? "success" : "danger"} size="sm">{el.status === "PAID" ? "Sudah Dibayar" : "Belum Dibayar"}</Chip>
                                                                    </TableCell>
                                                                </TableRow>
                                                            }) : <></>
                                                        }
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <p className="font-bold text-sm">List Menu: </p>
                                            <div className="grid gap-3 mt-3">
                                                <Table aria-label="Example static collection table" selectionMode="multiple">
                                                    <TableHeader>
                                                        <TableColumn>Menu</TableColumn>
                                                        <TableColumn>Qty</TableColumn>
                                                        <TableColumn>Subtotal</TableColumn>
                                                        <TableColumn>Status</TableColumn>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {
                                                            Array.isArray(detail.booking.order_cafe) && detail.booking.order_cafe.length !== 0 ? detail.booking.order_cafe.map((el) => {
                                                                return <TableRow key={el.id}>
                                                                    <TableCell>{el.menucafe.name}</TableCell>
                                                                    <TableCell>{el.qty}</TableCell>
                                                                    <TableCell>Rp. {convertRupiah(el.total.toString() || "0")}</TableCell>
                                                                    <TableCell>
                                                                        <Chip color={el.status === "PAID" ? "success" : "danger"} size="sm">{el.status === "PAID" ? "Sudah Dibayar" : "Belum Dibayar"}</Chip>
                                                                    </TableCell>
                                                                </TableRow>
                                                            }) : <></>
                                                        }

                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                }

            </DrawerContent>
        </Drawer>
    )
}