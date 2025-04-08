import { Dispatch, SetStateAction, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import toast from "react-hot-toast";

interface ModalCustomFilterProps {
    getDataRincian: (params: { filter?: string; start_date?: string; end_date?: string }) => Promise<boolean | undefined>;
    loading: boolean
    setOpenCustom: Dispatch<SetStateAction<boolean>>,
    open_custom: boolean
}

export default function ModalCustomFilter({ getDataRincian, loading, setOpenCustom, open_custom }: ModalCustomFilterProps) {

    const [start_date, setStartDate] = useState<string>("");
    const [end_date, setEndDate] = useState<string>("");

    const handleFilter = async () => {
        if (start_date.length === 0) {
            toast.error("Tanggal mulai wajib diisi");
        }

        if (end_date.length === 0) {
            toast.error("Tanggal berakhir wajib diisi");
        }

        const res = await getDataRincian({ filter: "custom", start_date: start_date, end_date });

        if (res) {
            setOpenCustom(false);
        }
    }

    return (
        <>
            <Modal isOpen={open_custom} onOpenChange={setOpenCustom}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Custom Filter</ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input label="Tanggal Mulai" type="date" onChange={(e) => setStartDate(e.target.value)} value={start_date} />
                                    <Input label="Tanggal Berakhir" type="date" onChange={(e) => setEndDate(e.target.value)} value={end_date} />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Kembali
                                </Button>
                                <Button color="primary" type="button" onPress={handleFilter} isLoading={loading}>
                                    Filter
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}