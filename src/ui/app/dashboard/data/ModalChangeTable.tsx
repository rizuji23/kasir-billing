import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Booking, TableBilliard } from "../../../../electron/types"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@heroui/modal";
import { Button } from "@heroui/react";
import SelectCustom from "../../../components/SelectCustom";
import toast from "react-hot-toast";

interface ModalChangeTable {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    detail: {
        table: TableBilliard,
        booking: Booking,
    } | null,
    setOpenBooking: Dispatch<SetStateAction<boolean>>
}

export default function ModalChangeTable({ open, setOpen, detail, setOpenBooking }: ModalChangeTable) {
    const [tables, setTables] = useState<TableBilliard[]>([]);
    const [selected_table, setSelectedTable] = useState<string>("");

    const getTables = async () => {
        try {
            const res = await window.api.table_list_not_used();

            if (res.status && res.data) {
                setTables(res.data);
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        }
    }

    useEffect(() => {
        if (open === true) {
            getTables();
        }
    }, [open]);

    const handleMoveTable = async () => {
        try {
            if (await window.api.confirm()) {
                if (!selected_table) {
                    toast.error("Pilih terlebih dahulu Meja yang ingin dituju");
                    return;
                }

                if (!detail?.booking && !detail?.table) {
                    toast.error("Booking tidak ditemukan");
                    return;
                }

                const res = await window.api.change_table(detail.table.id_table, selected_table, detail.booking.id_booking);

                if (res.status) {
                    toast.success("Table berhasil dipindahkan");
                    setOpen(false);
                    setOpenBooking(false);
                }
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        }
    }

    return (
        <>
            <Modal isOpen={open} onOpenChange={setOpen}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Pindah Meja</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-3">
                                    <SelectCustom label="Meja Billiard" onChange={(e) => setSelectedTable(e.target.value)} value={selected_table}>
                                        <SelectCustom.Option value="">Pilih Meja Billiard...</SelectCustom.Option>
                                        {
                                            tables.map((el, i) => {
                                                return <SelectCustom.Option value={el.id_table} key={i}>{el.name}</SelectCustom.Option>
                                            })
                                        }
                                    </SelectCustom>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Kembali
                                </Button>
                                <Button color="primary" onPress={handleMoveTable}>
                                    Pindah
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}