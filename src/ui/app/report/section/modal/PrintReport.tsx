import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    DateRangePicker,
    Select,
    SelectItem,
} from "@heroui/react";
import { Dispatch, SetStateAction } from "react";

export default function PrintReport({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    return (
        <>
            <Modal isOpen={open} onOpenChange={setOpen}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Print Laporan</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-3">
                                    <DateRangePicker visibleMonths={2} isRequired label="Dari dan Sampai Tanggal" />
                                    <Select label="Pilih tipe print" placeholder="Pilih tipe print">
                                        <SelectItem key={"Excel"}>{"Excel"}</SelectItem>
                                        <SelectItem key={"PDF"}>{"PDF"}</SelectItem>
                                        <SelectItem key={"Struk"}>{"Struk"}</SelectItem>
                                    </Select>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Batalkan
                                </Button>
                                <Button color="primary">
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