import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { CirclePlus, Percent, Trash } from "lucide-react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Input } from "@heroui/input";
import { DateRangePicker } from "@heroui/date-picker";
import { Form } from "@heroui/react";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import { toast } from "sonner";
import { IModalRow, IVoucher } from "../../../../electron/types";
import { IResponses } from "../../../../electron/lib/responses";
import { TableColumn } from "react-data-table-component";
import moment from "moment-timezone";
import DataTableCustom from "../../../components/datatable/DataTableCustom";
import type { RangeValue } from "@react-types/shared";
import type { DateValue } from "@react-types/datepicker";


function ModalVoucher({ open, setOpen, api }: { open: IModalRow<IVoucher>, setOpen: Dispatch<SetStateAction<IModalRow<IVoucher>>>, api: () => Promise<void> }) {
    const [expired, setExpired] = useState<RangeValue<DateValue> | null>(null);
    const [voucher_data, setVoucherData] = useState<{
        kode_voucher: string,
        discount: number
    }>({
        kode_voucher: "",
        discount: 0
    })
    const [loading_btn, setLoadingBtn] = useState<boolean>(false);
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            if (expired?.start || expired?.end) {
                const data = {
                    ...voucher_data,
                    start_date: expired.start.toDate(getLocalTimeZone()),
                    end_date: expired.end.toDate(getLocalTimeZone()),
                }

                let res;
                if (!open.row) {
                    res = await window.api.add_voucher(data);
                } else {
                    res = await window.api.update_voucher(data, open.row.id)
                }

                if (res.status) {
                    setLoadingBtn(false);
                    toast.success(`Voucher berhasil ${open.row ? "diubah" : "ditambahkan"}`);
                    api();
                    setOpen({
                        open: false,
                        row: null
                    })
                }
            }

        } catch (err) {
            setLoadingBtn(false)
            toast.error(`Gagal menambahkan Voucher: ${err}`);
        }
    }

    useEffect(() => {
        if (open.row) {
            setVoucherData({
                kode_voucher: open.row.kode_voucher,
                discount: open.row.discount
            })

            setExpired({
                start: parseDate(moment(open.row.start_date).format("YYYY-MM-DD")),
                end: parseDate(moment(open.row.end_date).format("YYYY-MM-DD")),
            })
        }
    }, [open.open]);

    return <Modal isOpen={open.open} onOpenChange={(isOpen) => setOpen({
        open: isOpen,
        row: null
    })}>
        <ModalContent>
            {(onClose) => (
                <Form className="!block" validationBehavior="native" onSubmit={onSubmit}>
                    <ModalHeader className="flex flex-col gap-1">Voucher</ModalHeader>
                    <ModalBody>
                        <div className="grid gap-3">
                            <Input
                                isRequired
                                label="Kode Voucher"
                                name="category_name"
                                errorMessage={"Silakan isi kolom ini."}
                                placeholder="Masukan Kode Voucher disini"
                                type="text"
                                onChange={(e) => setVoucherData((prevState) => ({
                                    ...prevState,
                                    kode_voucher: e.target.value
                                }))}
                                value={voucher_data.kode_voucher}
                            />
                            <Input
                                isRequired
                                label="Potongan"
                                name="category_name"
                                errorMessage={"Silakan isi kolom ini."}
                                placeholder="Masukan Potongan disini"
                                type="number"
                                onChange={(e) => setVoucherData((prevState) => ({
                                    ...prevState,
                                    discount: parseInt(e.target.value)
                                }))}
                                value={voucher_data.discount as unknown as string}
                                endContent={<Percent className="w-4 h-4" />}
                            />
                            <DateRangePicker label="Kadaluarsa" onChange={setExpired} />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onClose}>
                            Batalkan
                        </Button>
                        <Button color="primary" type="submit" isLoading={loading_btn}>
                            Simpan Perubahan
                        </Button>
                    </ModalFooter>
                </Form>
            )}
        </ModalContent>
    </Modal>
}

export default function VoucherSection() {
    const [open, setOpen] = useState<IModalRow<IVoucher>>({
        open: false,
        row: null
    })
    const [voucher, setVoucher] = useState<IVoucher[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const columns: TableColumn<IVoucher>[] = [
        {
            name: "Kode Voucher",
            selector: row => row.kode_voucher,
            cell: row => <button onClick={() => setOpen({
                open: true,
                row: row
            })} className="text-blue-500 hover:underline">{row.kode_voucher}</button>
        },
        {
            name: "Diskon",
            selector: row => row.discount,
            cell: row => <span>{row.discount}%</span>
        },
        {
            name: "Tanggal Mulai",
            selector: row => moment(row.start_date).format("DD/MM/YYYY")
        },
        {
            name: "Tanggal Berakhir",
            selector: row => moment(row.end_date).format("DD/MM/YYYY")
        },
        {
            name: "Tanggal Dibuat",
            selector: row => moment(row.created_at).format("DD/MM/YYYY")
        },
        {
            name: "Action",
            cell: row => (
                <Button
                    size="sm"
                    color="danger"
                    onPress={() => handleDelete(row)}
                    isIconOnly
                >
                    <Trash className="w-4 h-4" />
                </Button>
            )
        }
    ]

    const handleDelete = async (row: IVoucher) => {
        if (confirm(`Apakah anda yakin ingin menghapus "${row.kode_voucher}"?`)) {
            try {
                if (row.id) {
                    const res = await window.api.delete_voucher(row.id);

                    if (res.status) {
                        toast.success("Voucher berhasil dihapus");
                        getVoucher();
                    } else {
                        toast.error(res.detail_message || "Gagal menghapus Voucher");
                    }
                } else {
                    toast.error("ID Voucher tidak ada.");
                }

            } catch (err) {
                toast.error(`Error deleting category: ${err}`);
            }
        }
    }


    const getVoucher = async () => {
        setLoading(true);
        try {
            const res: IResponses<IVoucher[]> = await window.api.list_voucher();

            setLoading(false)
            if (res.status && res.data) {
                setVoucher(res.data);
            } else {
                toast.error(`Failed to fetch voucher list: ${res.detail_message}`);
            }
        } catch (err) {
            setLoading(false)
            toast.error(`Error fetching vouchers: ${err}`);
        }
    }

    useEffect(() => {
        getVoucher();
    }, [])

    return (
        <>
            <Card>
                <CardHeader className="font-bold w-full !justify-between">
                    <span>List Voucher</span>
                    <Button startContent={<CirclePlus className="w-4 h-4" />} onPress={() => setOpen({
                        open: true,
                        row: null
                    })}>Tambah Voucher</Button>
                </CardHeader>
                <CardBody>
                    <DataTableCustom columns={columns} data={voucher} progressPending={loading} />
                </CardBody>
            </Card>
            <ModalVoucher open={open} setOpen={setOpen} api={getVoucher} />
        </>
    )
}