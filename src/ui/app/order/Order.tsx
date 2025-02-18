import { Tab, Tabs } from "@heroui/tabs";
import MainLayout from "../../components/MainLayout";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { TableColumn } from "react-data-table-component";
import { Button } from "@heroui/button";
import DataTableCustom from "../../components/datatable/DataTableCustom";
import { Input } from "@heroui/input";
import { Search } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Divider } from "@heroui/divider";
import { Select, SelectItem } from "@heroui/select";

interface ExampleOrder {
    id_order: string,
    name: string,
    table_number: string,
    total: string,
    created_at: string
}

export function ModalDetailOrder({ open, setOpen, row }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, row: ExampleOrder }) {
    const [selected_payment, setSelectedPayment] = useState<string>("cash");

    return (
        <>
            <Modal isOpen={open} onOpenChange={setOpen} size="3xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Detail Order</ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Card>
                                            <CardHeader className="font-bold">List Menu (10)</CardHeader>
                                            <CardBody className="p-0">
                                                <Divider />
                                                <div className="max-h-[450px] min-h-[450px] overflow-autos">
                                                    <div className="grid gap-0">
                                                        <div className="flex justify-between p-3">
                                                            <div className="grid ">
                                                                <p className="font-semibold">Nasi Goreng</p>
                                                                <small>Rp. 20.000</small>
                                                                <p className="text-sm font-semibold mt-1">Qty: 1x</p>
                                                            </div>
                                                            <p className="self-center font-bold">Rp. 20.000</p>
                                                        </div>
                                                        <Divider />
                                                        <div className="flex justify-between p-3">
                                                            <div className="grid ">
                                                                <p className="font-semibold">Es Kopi</p>
                                                                <small>Rp. 50.000</small>
                                                                <p className="text-sm font-semibold mt-1">Qty: 2x</p>
                                                            </div>
                                                            <p className="self-center font-bold">Rp. 100.000</p>
                                                        </div>
                                                        <Divider />
                                                        <div className="flex justify-between p-3">
                                                            <div className="grid ">
                                                                <p className="font-semibold">Es Kopi</p>
                                                                <small>Rp. 50.000</small>
                                                                <p className="text-sm font-semibold mt-1">Qty: 2x</p>
                                                            </div>
                                                            <p className="self-center font-bold">Rp. 100.000</p>
                                                        </div>
                                                        <Divider />
                                                        <div className="flex justify-between p-3">
                                                            <div className="grid ">
                                                                <p className="font-semibold">Es Kopi</p>
                                                                <small>Rp. 50.000</small>
                                                                <p className="text-sm font-semibold mt-1">Qty: 2x</p>
                                                            </div>
                                                            <p className="self-center font-bold">Rp. 100.000</p>
                                                        </div>
                                                        <Divider />
                                                        <div className="flex justify-between p-3">
                                                            <div className="grid ">
                                                                <p className="font-semibold">Es Kopi</p>
                                                                <small>Rp. 50.000</small>
                                                                <p className="text-sm font-semibold mt-1">Qty: 2x</p>
                                                            </div>
                                                            <p className="self-center font-bold">Rp. 100.000</p>
                                                        </div>
                                                        <Divider />
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>
                                    <div>
                                        <div className="grid gap-3">
                                            <div>
                                                <Card>
                                                    <CardBody >
                                                        <div className="grid gap-0">
                                                            <div className="grid grid-cols-2 p-2">
                                                                <p className="font-semibold text-sm">ID Order</p>
                                                                <p className="text-end font-medium text-sm">{row.id_order}</p>
                                                            </div>
                                                            <Divider />
                                                            <div className="grid grid-cols-2 p-2">
                                                                <p className="font-semibold text-sm">Nama Pelanggan</p>
                                                                <p className="text-end font-medium text-sm">{row.name}</p>
                                                            </div>
                                                            <Divider />
                                                            <div className="grid grid-cols-2 p-2">
                                                                <p className="font-semibold text-sm">Nomor Meja</p>
                                                                <p className="text-end font-medium text-sm">{row.table_number}</p>
                                                            </div>
                                                            <Divider />
                                                            <div className="grid grid-cols-2 p-2">
                                                                <p className="font-semibold text-sm">Tanggal Order</p>
                                                                <p className="text-end font-medium text-sm">{row.created_at}</p>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </div>

                                            <div>
                                                <Card>
                                                    <CardBody>
                                                        <div className="grid gap-0">
                                                            <div className="grid grid-cols-2 p-2">
                                                                <p className="font-semibold text-sm">Subtotal</p>
                                                                <p className="text-end font-medium text-sm">Rp. 520.000</p>
                                                            </div>
                                                            <div className="grid grid-cols-2 p-2">
                                                                <p className="font-semibold text-sm">Potongan (10%)</p>
                                                                <p className="text-end font-medium text-sm">Rp. 10.000</p>
                                                            </div>
                                                            <Divider />
                                                            <div className="grid grid-cols-2 p-2">
                                                                <p className="font-semibold text-sm">Total</p>
                                                                <p className="text-end font-medium text-sm">Rp. 20.000</p>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </div>
                                            <div>
                                                <Card>
                                                    <CardBody>
                                                        <div className="grid gap-3">
                                                            <Select label="Pilih Metode Pembayaran" selectionMode="single" isRequired selectedKeys={[selected_payment]} onChange={(e) => {
                                                                setSelectedPayment(e.target.value)
                                                                console.log(e.target.value)
                                                            }}>
                                                                <SelectItem key={"cash"}>Cash</SelectItem>
                                                                <SelectItem key={"qris"}>QRIS</SelectItem>
                                                                <SelectItem key={"transfer"}>Transfer</SelectItem>
                                                            </Select>
                                                            <Input
                                                                isRequired
                                                                label="Jumlah Uang"
                                                                name="full_name"
                                                                errorMessage={"Silakan isi kolom ini."}
                                                                placeholder="Masukan Jumlah Cash disini"
                                                                type="text"
                                                            />
                                                            {
                                                                selected_payment.toString() === "cash" && (
                                                                    <>

                                                                        <Divider />
                                                                        <div className="grid grid-cols-2 p-2">
                                                                            <p className="font-semibold">Kembalian</p>
                                                                            <p className="text-end font-medium">Rp. 20.000</p>
                                                                        </div>
                                                                    </>
                                                                )
                                                            }
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Kembali
                                </Button>
                                <Button color="primary" onPress={onClose}>
                                    Bayar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

function DetailOrder({ row }: { row: ExampleOrder }) {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <Button color="success" size="sm" onPress={() => setOpen(true)}>{row.id_order}</Button>
            <ModalDetailOrder open={open} setOpen={setOpen} row={row} />
        </>
    )
}

const columns: TableColumn<ExampleOrder>[] = [
    {
        name: "ID Order",
        selector: row => row.id_order,
        cell: row => <DetailOrder row={row} />
    },
    {
        name: "Nama Pelanggan",
        selector: row => row.name,
        sortable: true
    },
    {
        name: "Nomor Meja",
        selector: row => row.table_number,
        sortable: true
    },
    {
        name: "Total",
        selector: row => row.total,
        sortable: true
    },
    {
        name: "Tanggal",
        selector: row => row.created_at,
        sortable: true
    },
]

export default function OrderPage() {
    const [selected, setSelected] = useState<string>("new");

    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">Order Masuk</h1>
                    </div>
                    <Tabs aria-label="Options" onSelectionChange={(e) => setSelected(e.toString())} selectedKey={selected}>
                        <Tab key="new" title={<div className="flex items-center space-x-2">
                            <span>Pesanan Masuk</span>
                            <Chip size="sm" color="danger">
                                3
                            </Chip>
                        </div>} />
                        <Tab key="pending" title="Pesanan Diproses" />
                        <Tab key="done" title="Pesanan Selesai" />
                    </Tabs>
                    <div className="w-full flex justify-end">
                        <div className="max-w-[300px] w-full">
                            <Input autoFocus startContent={<Search className="w-5 h-5" />} placeholder="Cari nama/id order disini..." />
                        </div>
                    </div>
                    <Card>
                        <CardBody>
                            <DataTableCustom columns={columns} data={[
                                {
                                    name: "M Rizki Fauzi",
                                    id_order: "QR2123",
                                    table_number: "20",
                                    total: "Rp. 100.000",
                                    created_at: "20/05/2025 12:00 AM"
                                }
                            ]} pagination />
                        </CardBody>
                    </Card>
                </div>
            </MainLayout>
        </>
    )
}