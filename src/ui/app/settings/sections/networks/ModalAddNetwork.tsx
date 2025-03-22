import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Form,
} from "@heroui/react";
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { IIPList } from "../../../../../electron/types";
import toast from 'react-hot-toast';
import SelectCustom from "../../../../components/SelectCustom";

export default function ModalAddNetwork({ open, setOpen, type_network = "cashier", my_ip, api }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, type_network: "cashier" | "kitchen", my_ip: string | null, api: () => Promise<void> }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [ip_list, setIpList] = useState<IIPList[]>([]);
    const [loadingBtn, setLoadingBtn] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>("");
    const [number, setNumber] = useState<string>("")

    const getIpLocal = async () => {
        setLoading(true)
        const res = await window.api.network_scan(type_network === "cashier" ? 3321 : 4321);

        setIpList(res.filter((el) => el.ip !== my_ip));
        setLoading(false);
        console.log(res);
    }

    useEffect(() => {
        if (open === true) {
            getIpLocal();
        }
    }, [open])

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingBtn(true)
        try {
            const res = await window.api.save_network({ ip: selected, number: number, hostname: "", type_server: type_network === "cashier" ? "CASHIER" : "KITCHEN" });
            setLoadingBtn(false)

            if (res.status) {
                toast.success("Jaringan berhasil disimpan");
                api();
                setOpen(false);
                window.location.reload();
            } else {
                toast.error(`Gagal menambahkan Network: ${res.detail_message}`);
            }
        } catch (err) {
            setLoadingBtn(false)
            toast.error(`Gagal menambahkan Network: ${err}`);
        }
    }

    return (
        <>
            <Modal isOpen={open} onOpenChange={setOpen}>
                <ModalContent>
                    {(onClose) => (
                        <Form className="!block" validationBehavior="native" onSubmit={onSubmit}>
                            <ModalHeader className="flex flex-col gap-1">Tambah {type_network === "cashier" ? "Kasir" : "Dapur"}</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-3">
                                    <SelectCustom disabled={loading} label="IP Address" onChange={(e) => setSelected(e.target.value)} value={selected}>
                                        <SelectCustom.Option value="">Pilih IP...</SelectCustom.Option>
                                        {
                                            ip_list.map((item) => (
                                                <SelectCustom.Option value={item.ip}>{item.ip}</SelectCustom.Option>
                                            ))
                                        }

                                    </SelectCustom>
                                    <Input isRequired name="number" onChange={(e) => setNumber(e.target.value)} value={number} type="number" label={`Nomor ${type_network === "cashier" ? "Kasir" : "Kitchen"}`} />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" type="button" variant="light" onPress={onClose}>
                                    Tutup
                                </Button>
                                <Button color="primary" type="submit" isLoading={loadingBtn}>
                                    Simpan
                                </Button>
                            </ModalFooter>
                        </Form>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
