import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Struk } from "../../../../../electron/types";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Divider,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@heroui/react";
import { Printer } from "lucide-react";
import toast from 'react-hot-toast';
import NotFound from "../../../../components/NotFound";
import { convertRupiah } from "../../../../lib/utils";
import moment from "moment-timezone";

export default function DetailTransaction({ open, setOpen }: { open: { open: boolean, row: Struk | null }, setOpen: Dispatch<SetStateAction<{ open: boolean, row: Struk | null }>> }) {
    const [detail, setDetail] = useState<Struk | null>(null);

    const getDetail = async () => {
        try {
            console.log("open.row?.id_struk", open.row?.id_struk)
            const res = await window.api.detail_transaction(open.row?.id_struk || "");
            console.log(res);
            if (res.status && res.data) {
                console.log("res.data", res.data)
                setDetail(res.data);
            }

        } catch (err) {
            toast.error(`Error fetching detail transaction: ${err}`);
        }
    }

    useEffect(() => {
        if (open.open === true) {
            getDetail();
        }
    }, [open]);

    return (
        <>
            <Modal size="5xl" scrollBehavior="inside" isOpen={open.open} onOpenChange={(isOpen) => setOpen({
                open: isOpen,
                row: null
            })}>
                <ModalContent>
                    {(onClose) => (
                        detail === null ? <NotFound /> : <>
                            <ModalHeader className="flex flex-col gap-1">Detail Transaksi</ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-3 h-fit">
                                        <div className="p-3 bg-default-100 rounded-md grid gap-2">
                                            <div className="grid grid-cols-2">
                                                <div>
                                                    <small>ID Order</small>
                                                    <p className="text-sm font-bold">{detail.id_struk}</p>
                                                </div>
                                                <div>
                                                    <small>Tipe Transaksi</small>
                                                    <p className="text-sm font-bold">{detail.type_struk}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2">
                                                <div>
                                                    <small>Nama Pemesan</small>
                                                    <p className="text-sm font-bold">{detail.name}</p>
                                                </div>
                                                <div>
                                                    <small>Metode Pembayaran</small>
                                                    <p className="text-sm font-bold">{detail.payment_method}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2">
                                                <div>
                                                    <small>Tanggal Order</small>
                                                    <p className="text-sm font-bold">{moment(detail.created_at).format("DD/MM/YYYY HH:mm:ss")}</p>
                                                </div>
                                                <div>
                                                    <small>Shift</small>
                                                    <p className="text-sm font-bold">{detail.shift || "-"}</p>
                                                </div>
                                            </div>
                                            <Divider />
                                            <div className="grid grid-cols-3">
                                                <div>
                                                    <small>Total Billing</small>
                                                    <p className="text-sm font-bold">Rp. {convertRupiah(detail.total_billing?.toString() || "0")}</p>
                                                </div>
                                                <div>
                                                    <small>Total Menu</small>
                                                    <p className="text-sm font-bold">Rp. {convertRupiah(detail.total_cafe?.toString() || "0")}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3">

                                                <div>
                                                    <small>Total Semua</small>
                                                    <p className="text-sm font-bold">Rp. {convertRupiah(detail.total.toString() || "0")}</p>
                                                </div>
                                                <div>
                                                    <small>Kembalian</small>
                                                    <p className="text-sm font-bold">Rp. {convertRupiah(detail.change.toString() || "0")}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-default-100 rounded-md grid gap-2">
                                            <Button size="sm" startContent={<Printer className="w-4 h-4" />} color="success">Print Struk</Button>
                                        </div>
                                    </div>
                                    <div className="grid gap-3">
                                        <div className="p-3 border-3 rounded-md flex flex-col gap-3 h-fit">
                                            <div className="flex flex-col gap-3">
                                                <h3 className="font-bold">Detail Pesanan</h3>
                                                <Divider />
                                                <div className="grid gap-2">
                                                    <p className="font-bold text-sm">List Billing: </p>
                                                    <div className="grid gap-3 mt-3">

                                                        <Table aria-label="Example static collection table">
                                                            <TableHeader>
                                                                <TableColumn>Jam Mulai</TableColumn>
                                                                <TableColumn>Jam Berakhir</TableColumn>
                                                                <TableColumn>Harga</TableColumn>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {
                                                                    (detail.bookingId?.detail_booking || []).map((el, i) => {
                                                                        return <TableRow key={i}>
                                                                            <TableCell>{moment(el.start_duration).format("HH:mm:ss")}</TableCell>
                                                                            <TableCell>{moment(el.end_duration).format("HH:mm:ss")}</TableCell>
                                                                            <TableCell>{convertRupiah(el.price.toString() || "0")}</TableCell>
                                                                        </TableRow>
                                                                    })
                                                                }

                                                            </TableBody>
                                                        </Table>
                                                        <p className="font-bold text-sm">Total Durasi: {detail.bookingId?.duration || "0"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <p className="font-bold text-sm">List Menu: </p>
                                                <Table aria-label="Example static collection table">
                                                    <TableHeader>
                                                        <TableColumn>Menu</TableColumn>
                                                        <TableColumn className="text-center">Qty</TableColumn>
                                                        <TableColumn>Harga</TableColumn>
                                                        <TableColumn>Subtotal</TableColumn>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {
                                                            detail.type_struk === "TABLE" ? (
                                                                (detail.bookingId?.order_cafe || []).map((el, i) => {
                                                                    return <TableRow key={i}>
                                                                        <TableCell>{el.menucafe.name}</TableCell>
                                                                        <TableCell>{el.qty}</TableCell>
                                                                        <TableCell>{convertRupiah(el.menucafe.price.toString() || "0")}</TableCell>
                                                                        <TableCell>{convertRupiah(el.total.toString() || "0")}</TableCell>
                                                                    </TableRow>
                                                                })
                                                            ) : (
                                                                (detail.orderId || []).map((el, i) => {
                                                                    return <TableRow key={i}>
                                                                        <TableCell>{el.menucafe.name}</TableCell>
                                                                        <TableCell>{el.qty}</TableCell>
                                                                        <TableCell>{convertRupiah(el.menucafe.price.toString() || "0")}</TableCell>
                                                                        <TableCell>{convertRupiah(el.subtotal.toString() || "0")}</TableCell>
                                                                    </TableRow>
                                                                })
                                                            )
                                                        }
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" onPress={onClose}>
                                    Tutup
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}