import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { CirclePlus } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

function ModalCategoryMenu({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    return <Modal isOpen={open} onOpenChange={setOpen}>
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1">Kategori Menu</ModalHeader>
                    <ModalBody>
                        <div className="grid gap-3">
                            <Input
                                isRequired
                                label="Nama Kategori"
                                name="category_name"
                                errorMessage={"Silakan isi kolom ini."}
                                placeholder="Masukan Nama Kategori disini"
                                type="text"
                            />
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

export default function CategoryMenu() {
    const [open, setOpen] = useState<boolean>(false)

    return (
        <>
            <Card>
                <CardHeader className="font-bold w-full !justify-between">
                    <span>List Kategori Menu</span>
                    <Button startContent={<CirclePlus className="w-4 h-4" />} onPress={() => setOpen(true)}>Tambah Kategori</Button>
                </CardHeader>
                <CardBody>

                </CardBody>
            </Card>
            <ModalCategoryMenu open={open} setOpen={setOpen} />
        </>
    )
}