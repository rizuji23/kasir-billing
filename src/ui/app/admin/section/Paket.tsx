import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@heroui/react";
import { Pencil, Trash } from "lucide-react";
import { PaketPrice, PaketSegment } from "../../../../electron/types";
import toast from "react-hot-toast";
import { convertRupiah, convertToInteger } from "../../../lib/utils";

interface ModalPaketInterface {
    open: boolean,
    data: undefined | null | PaketSegment
}

interface ModalPaketAddInterface {
    open: boolean,
    data: undefined | null | PaketPrice
}

function ModalAddUpdatePaket({ open, setOpen, getPaket, paket_segment }: { open: ModalPaketAddInterface, setOpen: Dispatch<SetStateAction<ModalPaketAddInterface>>, getPaket: (id: string) => Promise<void>, paket_segment: PaketSegment | null }) {
    const [data_paket, setDataPaket] = useState<{
        id_paket_segment: string;
        name: string;
        duration: string;
        price: string;
        is_last_call?: boolean;
        last_call_hours?: string;
    }>({
        id_paket_segment: "",
        name: "",
        duration: "",
        price: "",
        is_last_call: false,
        last_call_hours: "",
    });

    const [loading, setLoading] = useState<boolean>(false);


    useEffect(() => {
        if (open.open === true) {
            if (open.data) {
                setDataPaket({
                    id_paket_segment: paket_segment?.id_paket_segment || "",
                    name: open.data.name,
                    duration: open.data.duration.toString() || "0",
                    price: convertRupiah(open.data.price.toString() || "0"),
                    is_last_call: open.data.is_last_call,
                    last_call_hours: open.data.last_call_hours || "",
                })
            }
        }

        if (open.open === false) {
            setDataPaket({
                id_paket_segment: "",
                name: "",
                duration: "",
                price: "",
                is_last_call: false,
                last_call_hours: "",
            })
        }
    }, [open]);


    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (data_paket.name.length === 0) {
                toast.error("Nama wajib diisi");
                return;
            }

            if (data_paket.duration.length === 0) {
                toast.error("Duration wajib diisi");
                return;
            }

            if (data_paket.duration === "0") {
                toast.error("Duration tidak boleh nol");
                return;
            }

            if (data_paket.price.length === 0) {
                toast.error("Harga wajib diisi");
                return;
            }

            if (data_paket.is_last_call === true) {
                if (data_paket.last_call_hours?.length === 0) {
                    toast.error("Jam Last Call wajib diisi");
                    return;
                }
            }

            const new_data = {
                ...data_paket,
                id_paket_segment: paket_segment?.id_paket_segment || "",
                duration: Number(data_paket.duration || "0"),
                price: convertToInteger(data_paket.price || "0"),
                id_paket: open.data?.id_paket_price || "",
            }

            let res;

            if (open.data) {
                res = await window.api.update_paket(new_data);
            } else {
                res = await window.api.save_paket(new_data);
            }

            if (res.status) {
                toast.success("Paket Segment Berhasil Disimpan");
                await getPaket(new_data.id_paket_segment);
                setOpen({
                    open: false,
                    data: undefined
                })
            } else {
                toast.error(res.detail_message || "Terjadi kesalahan");
            }

            console.log("Data Paket", new_data);

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Modal isOpen={open.open} scrollBehavior="inside" onOpenChange={(isOpen) => setOpen({
                open: isOpen,
                data: undefined
            })}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{open.data ? "Edit" : "Tambah"} Paket</ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-3">
                                    <div className="grid gap-3">
                                        <Input label="Nama Paket" value={data_paket.name} onChange={(e) => setDataPaket((prevState) => ({
                                            ...prevState,
                                            name: e.target.value
                                        }))} placeholder="Masukkan nama paket" />
                                    </div>
                                    <div className="grid gap-3">
                                        <Input label="Durasi" value={data_paket.duration as unknown as string} onChange={(e) => setDataPaket((prevState) => ({
                                            ...prevState,
                                            duration: e.target.value,
                                        }))} placeholder="Masukkan durasi" type="number" />
                                    </div>
                                    <div className="grid gap-3">
                                        <Input label="Harga" value={convertRupiah(data_paket.price)} onChange={(e) => setDataPaket((prevState) => ({
                                            ...prevState,
                                            price: e.target.value
                                        }))} placeholder="Masukkan harga" type="text" />
                                    </div>
                                    <Switch size="sm" isSelected={data_paket.is_last_call} onChange={(e) => setDataPaket((prevState) => ({
                                        ...prevState,
                                        is_last_call: e.target.checked
                                    }))}>
                                        Apakah Last Call?
                                    </Switch>
                                    {
                                        data_paket.is_last_call && (
                                            <div className="grid gap-3">
                                                <Input label="Jam Last Call" type="time" value={data_paket.last_call_hours} onChange={(e) => setDataPaket((prevState) => ({
                                                    ...prevState,
                                                    last_call_hours: e.target.value
                                                }))} placeholder="Masukkan jam last call" />
                                            </div>
                                        )
                                    }

                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Tutup
                                </Button>
                                <Button color="primary" onPress={handleSubmit} isLoading={loading}>
                                    Simpan
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

function ModalAddDetailPaket({ open, setOpen, getPaketSegment }: { open: ModalPaketInterface, setOpen: Dispatch<SetStateAction<ModalPaketInterface>>, getPaketSegment: () => Promise<void> }) {
    const [open_paket, setOpenPaket] = useState<ModalPaketAddInterface>({
        open: false,
        data: undefined
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [paket_segment, setPaketSegment] = useState<PaketSegment | null>(null);

    const [data_segment, setDataSegment] = useState<{
        name: string;
        start_hours: string;
        end_hours: string;
    }>({
        name: "",
        start_hours: "",
        end_hours: "",
    });

    useEffect(() => {
        if (open.open === true) {
            if (open.data) {
                console.log(open.data)
                setPaketSegment(open.data);
                setDataSegment({
                    name: open.data.name,
                    start_hours: open.data.start_hours,
                    end_hours: open.data.end_hours
                })
            }
        }

        if (open.open === false) {
            setDataSegment({
                name: "",
                start_hours: "",
                end_hours: "",
            });
            setPaketSegment(null)
        }

        console.log(open)
    }, [open]);

    const handleSubmit = async () => {
        setLoading(true)
        try {
            if (data_segment.name.length === 0) {
                toast.error("Nama wajib diisi");
                return;
            }

            if (data_segment.start_hours.length === 0) {
                toast.error("Jam Mulai wajib diisi");
                return;
            }

            if (data_segment.end_hours.length === 0) {
                toast.error("Jam Berakhir wajib diisi");
                return;
            }

            let res;

            if (open.data) {
                res = await window.api.update_paket_segment({ ...data_segment, id_paket_segment: paket_segment?.id_paket_segment || "" });
            } else {
                res = await window.api.save_paket_segment(data_segment);
            }

            if (res.status) {
                toast.success("Paket Segment Berhasil Disimpan");
                await getPaketSegment();
                setOpen({
                    open: false,
                    data: undefined
                })
            } else {
                toast.error(res.detail_message || "Terjadi kesalahan");
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        } finally {
            setLoading(false);
        }
    }

    const getPaket = async (id: string) => {
        try {
            const res = await window.api.get_paket_by_id(id);

            if (res.status && res.data) {
                setPaketSegment(res.data);
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        }
    }

    const handleDelete = async (id: string) => {
        try {
            if (await window.api.confirm()) {
                const res = await window.api.delete_paket(id);

                if (res.status) {
                    toast.success("Paket berhasil dihapus");
                    await getPaket(open.data?.id_paket_segment || "");
                } else {
                    toast.error(`${res.detail_message}`)
                }
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`)
        }
    }

    return (
        <>
            <Modal isOpen={open.open} scrollBehavior="inside" onOpenChange={(isOpen) => setOpen({
                open: isOpen,
                data: undefined
            })}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Paket Segment</ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-3">
                                    <div className="grid gap-3">
                                        <Input label="Nama Paket Segment" value={data_segment.name} onChange={(e) => setDataSegment((prevState) => ({
                                            ...prevState,
                                            name: e.target.value
                                        }))} placeholder="Masukkan nama paket segment" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-3">
                                            <Input label="Jam Mulai" type="time" value={data_segment.start_hours} onChange={(e) => setDataSegment((prevState) => ({
                                                ...prevState,
                                                start_hours: e.target.value
                                            }))} placeholder="Masukkan jam mulai" />
                                        </div>
                                        <div className="grid gap-3">
                                            <Input label="Jam Berakhir" type="time" value={data_segment.end_hours} onChange={(e) => setDataSegment((prevState) => ({
                                                ...prevState,
                                                end_hours: e.target.value
                                            }))} placeholder="Masukkan jam mulai" />
                                        </div>
                                    </div>
                                    {
                                        open.data !== undefined ? (<>
                                            <Divider className="my-1" />
                                            <div className="flex flex-col gap-3">
                                                <div className="flex justify-between gap-3">
                                                    <p className="font-semibold text-large">List Paket:</p>
                                                    <Button size="sm" color="success" onPress={() => setOpenPaket({
                                                        open: true,
                                                        data: undefined
                                                    })}>Tambah Paket</Button>
                                                </div>
                                                <div className="grid gap-3">
                                                    {
                                                        (paket_segment?.paketPrice || []).map((el, i) => {
                                                            return <div key={i} className="p-3 bg-default-100 rounded-md">
                                                                <div className="flex justify-between">
                                                                    <div className="grid">
                                                                        <h3 className="text-sm font-semibold">{el.name}</h3>
                                                                        <p className="text-sm">Durasi Bermain: <span className="font-medium">{el.duration} Jam</span></p>
                                                                        {
                                                                            el.is_last_call && (<div>
                                                                                <small className="text-xs">Last Call:</small>
                                                                                <p className="text-sm font-semibold">{el.last_call_hours}</p>
                                                                            </div>)
                                                                        }
                                                                        <p className="font-semibold mt-2">Rp. {convertRupiah(el.price.toString() || "0")}</p>
                                                                    </div>
                                                                    <div className="flex gap-2 self-end">
                                                                        <Button size="sm" isIconOnly color="success" onPress={() => setOpenPaket({
                                                                            open: true,
                                                                            data: el
                                                                        })}><Pencil className="w-4 h-4 text-white" /></Button>
                                                                        <Button size="sm" isIconOnly color="danger" onPress={() => handleDelete(el.id_paket_price)}><Trash className="w-4 h-4 " /></Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </>) : <></>
                                    }
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Tutup
                                </Button>
                                <Button color="primary" onPress={handleSubmit} isLoading={loading}>
                                    Simpan
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <ModalAddUpdatePaket open={open_paket} setOpen={setOpenPaket} getPaket={getPaket} paket_segment={paket_segment} />
        </>
    )
}


export default function PaketAdmin() {
    const [open, setOpen] = useState<ModalPaketInterface>({
        open: false,
        data: undefined
    });

    const [paket_segment, setPaketSegment] = useState<PaketSegment[]>([]);

    const getPaketSegment = async () => {
        try {
            const res = await window.api.get_paket();

            if (res.status && res.data) {
                setPaketSegment(res.data);
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        }
    }

    const handleDelete = async (id: string) => {
        try {
            if (await window.api.confirm()) {
                const res = await window.api.delete_paket_segment(id);

                if (res.status) {
                    toast.success("Paket Segment berhasil dihapus");
                    await getPaketSegment();
                } else {
                    toast.error(`${res.detail_message}`)
                }
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`)
        }
    }

    useEffect(() => {
        if (open.open === false) {
            getPaketSegment();
        }
    }, [open]);

    useEffect(() => {
        getPaketSegment();
    }, [])

    return (
        <>
            <div className="grid gap-4">
                <Card>
                    <CardHeader className="!w-full">
                        <div className="flex justify-between w-full">
                            <h3 className="font-bold self-center">Paket Segment</h3>
                            <Button onPress={() => setOpen({
                                open: true,
                                data: undefined
                            })}>Tambah Paket Segment</Button>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <Table removeWrapper>
                            <TableHeader>
                                <TableColumn>Nama Paket Segment</TableColumn>
                                <TableColumn>Jam Mulai</TableColumn>
                                <TableColumn>Jam Berakhir</TableColumn>
                                <TableColumn>Opsi</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {
                                    paket_segment.map((el, i) => {
                                        return <TableRow key={i}>
                                            <TableCell>{el.name}</TableCell>
                                            <TableCell>{el.start_hours}</TableCell>
                                            <TableCell>{el.end_hours}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-3">
                                                    <Button size="sm" color="success" onPress={() => setOpen({
                                                        open: true,
                                                        data: el
                                                    })}>Detail</Button>
                                                    <Button size="sm" color="danger" onPress={() => handleDelete(el.id_paket_segment)}>Hapus</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    })
                                }
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>

            <ModalAddDetailPaket open={open} setOpen={setOpen} getPaketSegment={getPaketSegment} />
        </>
    )
}