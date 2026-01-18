import { SetStateAction } from "jotai";
import { Dispatch } from "react";
import { IRejectIncoming } from "../../../electron/types";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, Textarea, Divider } from "@heroui/react";
import { Badge, Card, CardBody, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { formatDateTime, formatToRupiah } from "../../lib/utils";
import { CalendarIcon, ClockIcon, HandPlatter, Info, UserIcon, XCircle } from "lucide-react";
import toast from "react-hot-toast";

function TableOrderItem({ data }: { data: IRejectIncoming | null }) {
    return <Card shadow="sm">
        <CardBody>
            <Table removeWrapper isStriped >
                <TableHeader>
                    <TableColumn>Menu</TableColumn>
                    <TableColumn>Kategori</TableColumn>
                    <TableColumn className="text-center">Qty</TableColumn>
                    <TableColumn className="text-right">Harga</TableColumn>
                    <TableColumn className="text-right">Subtotal</TableColumn>
                </TableHeader>
                <TableBody>
                    {(data?.order.order || []).map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div>
                                    <p className="font-medium">{item.menucafe.name}</p>
                                    <p className="text-xs text-muted-foreground">Order ID: {item.id_order_cafe}</p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="solid">{item.menucafe.category_name}</Badge>
                            </TableCell>
                            <TableCell className="text-center">{item.qty}</TableCell>
                            <TableCell className="text-right">{formatToRupiah(item.menucafe.price.toString())}</TableCell>
                            <TableCell className="text-right font-medium">{formatToRupiah(item.subtotal.toString())}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardBody>
    </Card>
}

export default function DialogOrderReject({ open, setOpen, data }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, data: IRejectIncoming | null }) {

    const handleDeleteOrder = async () => {
        if (await window.api.confirm("Apakah anda yakin?")) {
            if (data?.order === undefined) {
                toast.error("Data Order Tidak Ditemukan!");
                return;
            }

            const id_orders = data.order.order.map((el) => el.id_order_cafe);

            if (id_orders.length === 0) {
                toast.error("ID Order tidak ditemukan");
                return;
            }

            const res = await window.api.reject_order(id_orders);

            if (res.status) {
                setOpen(false);
                toast.success("Order berhasil direject");
            } else {
                toast.error("Terjadi kesalahan, hubungi developer");
            }
        }
    }

    return (
        <>
            <Modal
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                isOpen={open}
                onOpenChange={setOpen}
                backdrop="blur"
                size="3xl"
                hideCloseButton={true}
            >
                <ModalContent>
                    <ModalHeader className="flex gap-3"><Info className="self-center w-4 h-4 text-muted-foreground" /> <span>Order Ditolak Dari Dapur ({data?.order.order[0]?.id_order_cafe})</span></ModalHeader>
                    <ModalBody className="max-h-[500px] overflow-y-auto">
                        <div className="grid gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card shadow="sm">
                                    <CardBody className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Nama Pelanggan</span>
                                        </div>
                                        <p className="text-sm">{data?.order.order[0].name}</p>
                                    </CardBody>
                                </Card>

                                <Card shadow="sm">
                                    <CardBody className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <HandPlatter className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Meja</span>
                                        </div>
                                        {
                                            data?.order.order_type === "CAFE" ? <p className="text-sm">Meja {data?.order.no_meja}</p> : <p className="text-sm">{data?.order.no_billiard}</p>
                                        }
                                    </CardBody>
                                </Card>

                                <Card shadow="sm">
                                    <CardBody className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ClockIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Status Dapur</span>
                                        </div>
                                        <Chip color={"danger"}>
                                            Ditolak
                                        </Chip>
                                    </CardBody>
                                </Card>

                                <Card shadow="sm">
                                    <CardBody className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Waktu Pesan</span>
                                        </div>
                                        <p className="text-xs">{formatDateTime(data?.order.created_at as unknown as string)}</p>
                                    </CardBody>
                                </Card>
                            </div>
                            <TableOrderItem data={data} />
                            <div className="flex justify-end">
                                <div className="flex gap-3">
                                    <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-2 gap-10">
                                            <p className="text-sm font-semibold">Subtotal</p>
                                            <p className="text-sm text-end">Rp. {formatToRupiah((data?.order.order[0].subtotal || 0).toString())}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-10">
                                            <p className="text-sm font-semibold">Total</p>
                                            <p className="text-sm text-end">Rp. {formatToRupiah((data?.order.order[0].total || 0).toString())}</p>
                                        </div>
                                    </div>
                                    <Divider orientation="vertical" />
                                    <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-2 gap-10">
                                            <p className="text-sm font-semibold">Cash</p>
                                            <p className="text-sm text-end">Rp. {formatToRupiah((data?.order.order[0].cash || 0).toString())}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-10">
                                            <p className="text-sm font-semibold">Kembalian</p>
                                            <p className="text-sm text-end">Rp. {formatToRupiah((data?.order.order[0].change || 0).toString())}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Divider />
                            <Textarea label={"Alasan Ditolak: "} readOnly value={data?.reason} />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" onPress={handleDeleteOrder} startContent={<XCircle className="w-4 h-4" />}>
                            Reject Order
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}