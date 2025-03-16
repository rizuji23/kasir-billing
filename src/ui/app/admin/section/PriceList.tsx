import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { PriceBilling } from "../../../../electron/types";
import toast from "react-hot-toast";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from "@heroui/table";
import { Button, Chip, Form, Input } from "@heroui/react";
import { convertRupiah, convertToInteger } from "../../../lib/utils";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@heroui/react";


interface ModalPriceType { open: boolean, data: PriceBilling | undefined }

function ModalPrice({ open, setOpen, getPrice }: { open: ModalPriceType, setOpen: Dispatch<SetStateAction<ModalPriceType>>, getPrice: () => void }) {
    const [data_price, setDataPrice] = useState<{
        start_from: string,
        end_from: string
    }>({
        start_from: "",
        end_from: ""
    })
    const [price, setPrice] = useState<string>("");

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const data = Object.fromEntries(new FormData(e.currentTarget));
            const res = await window.api.update_price({ ...data, id_price: open.data?.id_price_billing, price: convertToInteger(price) } as unknown as { id_price: string, start_from: string, end_from: string, price: number });

            if (res.status) {
                toast.success("Harga berhasil diubah");
                getPrice();
                setOpen({
                    open: false,
                    data: undefined
                })
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        }
    }

    useEffect(() => {
        if (open.open === true) {
            if (open.data) {
                setDataPrice({
                    start_from: open.data.start_from,
                    end_from: open.data.end_from
                })

                setPrice(convertRupiah(open.data.price.toString() || "0"));
            }
        } else {
            setDataPrice({
                start_from: "",
                end_from: ""
            })

            setPrice("");
        }
    }, [open]);

    return (
        <>
            <Modal isOpen={open.open} onOpenChange={(isOpen) => setOpen({
                open: isOpen,
                data: undefined
            })}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <Form className="!block" validationBehavior="native" onSubmit={onSubmit}>
                                <ModalHeader className="flex flex-col gap-1">Ubah Harga</ModalHeader>
                                <ModalBody>
                                    <div className="grid gap-3">
                                        <Input label="Dari Jam" onChange={(e) => setDataPrice((prev) => ({
                                            ...prev,
                                            start_from: e.target.value
                                        }))} value={data_price.start_from} name="start_from" isRequired type="time" placeholder="Pilih dari jam disini..." />
                                        <Input label="Sampai Jam" onChange={(e) => setDataPrice((prev) => ({
                                            ...prev,
                                            end_from: e.target.value
                                        }))} value={data_price.end_from} name="end_from" isRequired type="time" placeholder="Pilih sampai jam disini..." />
                                        <Input
                                            isRequired
                                            label="Harga"
                                            name="uang_cash"
                                            placeholder="Masukan Harga disini..."
                                            type="text"
                                            value={convertRupiah(price)}
                                            onValueChange={(e) => {
                                                const rawValue = e.replace(/\D/g, "");
                                                setPrice(rawValue);
                                            }}
                                        />
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" type="button" onPress={onClose}>
                                        Kembali
                                    </Button>
                                    <Button color="primary" type="submit">
                                        Simpan
                                    </Button>
                                </ModalFooter>
                            </Form>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}


export default function PriceList() {
    const [price, setPrice] = useState<PriceBilling[]>([]);
    const [open, setOpen] = useState<ModalPriceType>({
        open: false,
        data: undefined
    })

    const getPrice = async () => {
        try {
            const res = await window.api.get_price_list();

            if (res.status && res.data) {
                setPrice(res.data);
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        }
    }

    useEffect(() => {
        getPrice();
    }, [])

    return (
        <>
            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <h3 className="font-bold">Harga Billing</h3>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <Table aria-label="Example static collection table" removeWrapper>
                            <TableHeader>
                                <TableColumn>Tipe Harga</TableColumn>
                                <TableColumn>Tipe Hari</TableColumn>
                                <TableColumn>Harga</TableColumn>
                                <TableColumn>Dari Jam</TableColumn>
                                <TableColumn>Sampai Jam</TableColumn>
                                <TableColumn>Opsi</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {
                                    price.map((el, i) => {
                                        return <TableRow key={i}>
                                            <TableCell>{el.type_price.type_price}</TableCell>
                                            <TableCell>
                                                <Chip size="sm" color={el.season === "Pagi" ? "default" : "warning"}>{el.season}</Chip>
                                            </TableCell>
                                            <TableCell>{convertRupiah(el.price.toString() || "0")}</TableCell>
                                            <TableCell>{el.start_from || "-"}</TableCell>
                                            <TableCell>{el.end_from || "-"}</TableCell>
                                            <TableCell>
                                                <Button size="sm" onPress={() => setOpen({
                                                    open: true,
                                                    data: el
                                                })}>Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    })
                                }

                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>
            <ModalPrice open={open} setOpen={setOpen} getPrice={getPrice} />
        </>
    )
}