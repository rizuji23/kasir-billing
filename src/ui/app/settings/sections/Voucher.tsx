import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { CirclePlus, Percent } from "lucide-react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "@heroui/input";
import { DateRangePicker } from "@heroui/date-picker";

function ModalVoucher({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    return <Modal isOpen={open} onOpenChange={setOpen}>
        <ModalContent>
            {(onClose) => (
                <>
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
                            />
                            <Input
                                isRequired
                                label="Potongan"
                                name="category_name"
                                errorMessage={"Silakan isi kolom ini."}
                                placeholder="Masukan Potongan disini"
                                type="text"
                                endContent={<Percent className="w-4 h-4" />}
                            />
                            <DateRangePicker label="Kadaluarsa" />;
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onClose}>
                            Batalkan
                        </Button>
                        <Button color="primary" onPress={onClose}>
                            Simpan Perubahan
                        </Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>
}

export default function VoucherSection() {
    const [open, setOpen] = useState<boolean>(false)

    return (
        <>
            <Card>
                <CardHeader className="font-bold w-full !justify-between">
                    <span>List Voucher</span>
                    <Button startContent={<CirclePlus className="w-4 h-4" />} onPress={() => setOpen(true)}>Tambah Voucher</Button>
                </CardHeader>
                <CardBody>

                </CardBody>
            </Card>
            <ModalVoucher open={open} setOpen={setOpen} />
        </>
    )
}