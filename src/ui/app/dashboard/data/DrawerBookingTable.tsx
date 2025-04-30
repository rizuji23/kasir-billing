import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Booking, TableBilliard } from "../../../../electron/types";
import { Drawer, DrawerContent } from "@heroui/drawer";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { ArrowBigDown, Banknote, Check, Printer, RefreshCcw, X } from "lucide-react";
import toast from 'react-hot-toast';
import NotFound from "../../../components/NotFound";
import moment from "moment-timezone";
import { Input } from "@heroui/input";
import { Chip, Radio, RadioGroup } from "@heroui/react";
import { convertRupiah } from "../../../lib/utils";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from "@heroui/table";
import usePaymentTable from "../../../hooks/usePaymentTable";
import ModalChangeTable from "./ModalChangeTable";
import SelectCustom from "../../../components/SelectCustom";


export default function DrawerBookingTable({ open, setOpen, table }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, table: TableBilliard }) {
    const [detail, setDetail] = useState<{
        table: TableBilliard,
        booking: Booking,
    } | null>(null);

    const [editName, setEditName] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [open_change, setOpenChange] = useState<boolean>(false);

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

    const handleResetTable = async () => {
        try {
            if (await window.api.confirm()) {
                if (!detail?.booking && !detail?.table) {
                    toast.error("Booking tidak ditemukan");
                    return;
                }

                const res = await window.api.reset_table(detail.booking.id_booking, detail.table.id_table);

                if (res.status) {
                    toast.success("Reset table berhasil dilakukan.");
                    setOpen(false);
                } else {
                    toast.error(res.detail_message || "");
                }
            }

        } catch (err) {
            toast.error(`Reset table error: ${err}`);
        }
    }

    useEffect(() => {
        if (open === true) {
            getDetailBookingTable();
        }
    }, [open]);

    const payment = usePaymentTable({ getDetailBookingTable, detail, open, setOpen, table });

    return (
        <>
            <Drawer isOpen={open} onOpenChange={setOpen} size="full">
                <DrawerContent className="h-screen overflow-y-hidden">
                    {
                        !detail ? <NotFound /> :
                            <div className="grid gap-4 p-6">
                                <div className="flex flex-col gap-3">
                                    <h3 className="font-bold">Detail Pembayaran ({table.name})</h3>
                                    <Divider />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="overflow-x-auto h-screen pe-5 pb-24">
                                        <div className="grid gap-3">
                                            <div className="p-3 border-3 rounded-md flex justify-start gap-3">
                                                <Button startContent={<RefreshCcw className="w-4 h-4" />} onPress={handleResetTable}>Reset Meja</Button>
                                                <Button onPress={payment.printStruk} startContent={<Printer className="w-4 h-4" />}>Print Struk Billing</Button>
                                                <Button startContent={<ArrowBigDown className="w-4 h-4" />} onPress={() => setOpenChange(true)}>Pindah Meja</Button>
                                            </div>
                                            <div className="grid gap-2">
                                                <span className="text-sm font-semibold">Informasi Pemesan:</span>
                                                <div className="p-3 bg-default-100 rounded-md grid gap-2">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
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
                                                        <div>
                                                            <small>Tipe Mode:</small>
                                                            <p className="text-sm font-bold">{detail.table.type_play}</p>
                                                        </div>
                                                        <div>
                                                            <small>Blink:</small>
                                                            <p className="text-sm font-bold">{detail.table.blink === true ? "Iya" : "Tidak"}</p>
                                                        </div>
                                                        <div>
                                                            <small>Waktu Order:</small>
                                                            <p className="text-sm font-bold">{moment(detail.booking.created_at).format("DD/MM/YYYY HH:mm:ss")}</p>
                                                        </div>
                                                    </div>


                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <span className="text-sm font-semibold">Pembayaran:</span>
                                                <div className="p-3 bg-default-100 rounded-md grid gap-2">
                                                    <div className="grid grid-cols-2">
                                                        <div>
                                                            <small>Total Harga Billing</small>
                                                            <p className="text-sm font-bold">Rp. {convertRupiah(payment.total?.total_billing.toString() || "0")}</p>
                                                        </div>
                                                        <div>
                                                            <small>Total Harga Menu</small>
                                                            <p className="text-sm font-bold">Rp. {convertRupiah(payment.total?.total_cafe.toString() || "0")}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <small>Total Durasi</small>
                                                        <p className="text-sm font-bold">{payment.duration} Jam</p>
                                                    </div>
                                                    <Divider />
                                                    <div className="grid grid-cols-3">
                                                        <div>
                                                            <small>Diskon Billing</small>
                                                            <p className=" font-bold">{payment.discount_billing}%</p>
                                                        </div>
                                                        <div>
                                                            <small>Diskon Menu</small>
                                                            <p className=" font-bold">{payment.discount_cafe}%</p>
                                                        </div>
                                                        <div>
                                                            <small>Subtotal Semua</small>
                                                            <p className=" font-bold">Rp. {convertRupiah(payment.total?.subtotal.toString() || "0")}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <small>Total Semua</small>
                                                        <p className=" font-bold">Rp. {convertRupiah(payment.total?.total_all.toString() || "0")}</p>
                                                    </div>
                                                    <Divider />
                                                    {
                                                        payment.is_split_bill && (
                                                            <div>
                                                                <small>Nama <small className="text-danger-500">*</small></small>
                                                                <Input isRequired placeholder="Masukan nama pelanggan disini..." variant="bordered" autoFocus onChange={(e) => payment.setNameSplit(e.target.value)} value={payment.name_split} />
                                                            </div>
                                                        )
                                                    }
                                                    <div>
                                                        <small>Jumlah Pembayaran <small className="text-danger-500">*</small></small>
                                                        <Input variant="bordered" placeholder="Masukan jumlah pembayaran disini..." isRequired value={convertRupiah(payment.payment_cash)}
                                                            onValueChange={(e) => payment.handlePaymentChange(e)} classNames={{ input: "font-bold" }} autoFocus startContent={<span className="font-bold">Rp. </span>} />
                                                    </div>
                                                    <div>
                                                        <small>Cara Pembayaran <small className="text-danger-500">*</small></small>
                                                        <RadioGroup orientation="horizontal" isRequired className="mt-2" value={payment.payment_method} onValueChange={(e) => payment.setPaymentMethod(e)}>
                                                            <Radio classNames={{ label: "text-sm" }} value={"CASH"}>Cash</Radio>
                                                            <Radio classNames={{ label: "text-sm" }} value={"TRANSFER"}>Transfer</Radio>
                                                            <Radio classNames={{ label: "text-sm" }} value={"QRIS"}>QRIS</Radio>
                                                        </RadioGroup>
                                                    </div>
                                                    <Divider />
                                                    <div>
                                                        <small>Kembalian</small>
                                                        <p className=" font-bold">Rp. {convertRupiah(payment.change.toString() || "0")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 justify-end">
                                                <Button variant="bordered" color="danger" type="button" onPress={() => setOpen(false)}>Kembali</Button>
                                                <Button color="success" type="button" onPress={payment.checkOut} isLoading={payment.loading} startContent={<Banknote className="w-4 h-4" />}>{payment.is_split_bill ? "Bayar Split Bill" : "Bayar Sekarang"}</Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-screen overflow-x-auto pb-24">
                                        <div className="p-3 border-3 rounded-md flex flex-col gap-3 h-fit">
                                            <div className="flex flex-col gap-3">
                                                <h3 className="font-bold">Detail Pesanan</h3>
                                                <Divider />
                                                <div className="grid gap-2">
                                                    <p className="font-bold text-sm">List Billing: </p>
                                                    <div className="grid gap-3 mt-3">
                                                        {/* <Table selectionMode="multiple" onSelectionChange={payment.setSelectedBooking} selectedKeys={payment.selected_booking}> */}
                                                        <Table>
                                                            <TableHeader>
                                                                <TableColumn>Jam Mulai</TableColumn>
                                                                <TableColumn>Jam Berakhir</TableColumn>
                                                                <TableColumn>Harga</TableColumn>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {
                                                                    payment.list_booking.length !== 0 ? payment.list_booking.map((el) => {
                                                                        return <TableRow key={el.id}>
                                                                            <TableCell>{moment(el.start_duration).format("HH:mm:ss")}</TableCell>
                                                                            <TableCell>{moment(el.end_duration).format("HH:mm:ss")}</TableCell>
                                                                            <TableCell>{el.idPaketPrice !== null ? `${el.paket?.name} (Paket)` : `Rp. ${convertRupiah(el.price.toString() || "0")}`}</TableCell>
                                                                            {/* <TableCell>
                                                                                <Chip color={el.status === "PAID" ? "success" : "danger"} size="sm">{el.status === "PAID" ? "Sudah Dibayar" : "Belum Dibayar"}</Chip>
                                                                            </TableCell> */}
                                                                        </TableRow>
                                                                    }) : <></>
                                                                }
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                    <SelectCustom label="Diskon Billing" onChange={(e) => payment.setDiscountBilling(e.target.value)} value={payment.discount_billing}>
                                                        {
                                                            Array.from({ length: 101 }).map((_, i) => {
                                                                return <SelectCustom.Option key={i} value={i.toString()}>{i}%</SelectCustom.Option>
                                                            })
                                                        }
                                                    </SelectCustom>
                                                </div>
                                                <div className="grid gap-2">
                                                    <p className="font-bold text-sm">List Menu: </p>
                                                    <div className="grid gap-3 mt-3">
                                                        {/* <Table selectionMode="multiple" onSelectionChange={payment.setSelectedCafe} selectedKeys={payment.selected_cafe}> */}
                                                        <Table>
                                                            <TableHeader>
                                                                <TableColumn>Menu</TableColumn>
                                                                <TableColumn className="text-center">Qty</TableColumn>
                                                                <TableColumn>Subtotal</TableColumn>
                                                                <TableColumn>Status</TableColumn>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {
                                                                    payment.list_cafe.length !== 0 ? payment.list_cafe.map((el) => {
                                                                        return <TableRow key={el.id}>
                                                                            <TableCell>
                                                                                <div className="flex flex-col">
                                                                                    <p className="font-semibold">{el.menucafe.name}</p>
                                                                                    <small>Rp. {convertRupiah(el.menucafe.price.toString() || "0")}</small>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="text-center">{el.qty}</TableCell>
                                                                            <TableCell>Rp. {convertRupiah(el.total.toString() || "0")}</TableCell>
                                                                            <TableCell>
                                                                                <Chip color={el.status === "PAID" ? "success" : "danger"} size="sm">{el.status === "PAID" ? "Sudah Dibayar" : "Belum Dibayar"}</Chip>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    }) : <></>
                                                                }
                                                            </TableBody>
                                                        </Table>
                                                        <SelectCustom label="Diskon Menu" onChange={(e) => payment.setDiscountCafe(e.target.value)} value={payment.discount_cafe}>
                                                            {
                                                                Array.from({ length: 101 }).map((_, i) => {
                                                                    return <SelectCustom.Option key={i} value={i.toString()}>{i}%</SelectCustom.Option>
                                                                })
                                                            }
                                                        </SelectCustom>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    }

                </DrawerContent>
            </Drawer>
            <ModalChangeTable open={open_change} setOpen={setOpenChange} detail={detail} setOpenBooking={setOpen} />
        </>
    )
}