import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from "@heroui/react";
import moment from "moment-timezone";
import { Dispatch, SetStateAction, useState } from "react";
import toast from 'react-hot-toast';
import SelectCustom from "../../../../components/SelectCustom";

export default function PrintReportCafe({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    const [date, setDate] = useState<{ start_date: string, end_date: string }>({
        start_date: moment().format("YYYY-MM-DD"),
        end_date: moment().format("YYYY-MM-DD"),
    })
    const [type_export, setTypeExport] = useState<string>("excel");
    const [loading, setLoading] = useState<boolean>(false);
    const [shift, setShift] = useState<string>("all")

    const handleExportReport = async () => {
        setLoading(true)
        try {

            const res = await window.api.export_report(type_export, date.start_date, date.end_date, shift);
            setLoading(false);

            if (res.status) {
                toast.success("Laporan berhasil diprint");
            } else {
                toast.error(res.detail_message || "");
            }

        } catch (err) {
            setLoading(false);
            toast.error(`Gagal menambahkan Voucher: ${err}`);
        }
    }

    return (
        <>
            <Modal isOpen={open} onOpenChange={setOpen}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Print Laporan Cafe</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input label="Tanggal Mulai" value={date.start_date} onChange={(e) => setDate((prevState) => ({
                                            ...prevState,
                                            start_date: e.target.value
                                        }))} type="date" />
                                        <Input label="Tanggal Berakhir" value={date.end_date} onChange={(e) => setDate((prevState) => ({
                                            ...prevState,
                                            end_date: e.target.value
                                        }))} type="date" />
                                    </div>
                                    <SelectCustom label="Pilih Tipe Print" onChange={(e) => setTypeExport(e.target.value)} value={type_export}>
                                        <SelectCustom.Option value="excel">Excel</SelectCustom.Option>
                                        <SelectCustom.Option value="pdf">PDF</SelectCustom.Option>
                                    </SelectCustom>

                                    {
                                        type_export === "pdf" && (
                                            <SelectCustom label="Pilih Shift" onChange={(e) => setShift(e.target.value)} value={shift}>
                                                <SelectCustom.Option value="all">Semua</SelectCustom.Option>
                                                <SelectCustom.Option value="Pagi">Pagi</SelectCustom.Option>
                                                <SelectCustom.Option value="Malam">Malam</SelectCustom.Option>
                                            </SelectCustom>
                                        )
                                    }
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Batalkan
                                </Button>
                                <Button color="primary" onPress={handleExportReport} isLoading={loading}>
                                    Print Sekarang
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}