import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from "@heroui/table";
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { Shift } from "../../../../electron/types";
import toast from "react-hot-toast";
import moment from "moment-timezone";
import { Button, Form, Input } from "@heroui/react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@heroui/modal";

interface OpenModalShiftType {
    open: boolean,
    data: Shift | undefined
}

function ModalShift({ open, setOpen, getShift }: {
    open: OpenModalShiftType,
    setOpen: Dispatch<SetStateAction<OpenModalShiftType>>,
    getShift: () => void
}) {
    const [startHours, setStartHours] = useState<string>("");
    const [endHours, setEndHours] = useState<string>("");

    const timestampToTime = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const timeToDate = (time: string): Date => {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const data = Object.fromEntries(new FormData(e.currentTarget)) as unknown as { start_hours: string, end_hours: string };
            console.log("data", data);
            const data_start = timeToDate(data.start_hours);
            const data_end = timeToDate(data.end_hours);

            if (!open.data?.id) {
                toast.error("Id Shift tidak ditemukan");
                return;
            }

            const res = await window.api.update_shift({ id_shift: open.data.id, start_hours: data_start, end_hours: data_end });

            if (res.status) {
                toast.success("Shift berhasil diubah");
                getShift();
                setOpen({
                    open: false,
                    data: undefined
                })
            } else {
                toast.error(res.detail_message || "Terjadi kesalahan");
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        }
    }

    useEffect(() => {
        if (open.open === true) {
            if (open.data) {
                setStartHours(timestampToTime(open.data.start_hours))
                setEndHours(timestampToTime(open.data.end_hours))
            }
        } else {
            setStartHours("");
            setEndHours("");
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
                        <Form onSubmit={onSubmit} validationBehavior="native" className="!block">
                            <ModalHeader className="flex flex-col gap-1">Ubah Shift</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-3">
                                    <Input label="Jam Mulai" value={startHours} onChange={(e) => setStartHours(e.target.value)} type="time" placeholder="Masukan jam mulai disini..." isRequired name="start_hours" />
                                    <Input label="Jam Berakhir" value={endHours} onChange={(e) => setEndHours(e.target.value)} type="time" placeholder="Masukan jam berakhir disini..." isRequired name="end_hours" />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" type="button" variant="light" onPress={onClose}>
                                    Kembali
                                </Button>
                                <Button color="primary" type="submit">
                                    Simpan
                                </Button>
                            </ModalFooter>
                        </Form>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default function ShiftList() {
    const [shift, setShift] = useState<Shift[]>([]);
    const [open, setOpen] = useState<OpenModalShiftType>({
        open: false,
        data: undefined
    })

    const getShift = async () => {
        try {
            const res = await window.api.get_shift();

            if (res.status && res.data) {
                setShift(res.data);
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        }
    }

    useEffect(() => {
        getShift();
    }, [])

    return (
        <>
            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <h3 className="font-bold">Shift List</h3>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <Table removeWrapper>
                            <TableHeader>
                                <TableColumn>Shift</TableColumn>
                                <TableColumn>Jam Mulai</TableColumn>
                                <TableColumn>Jam Berakhir</TableColumn>
                                <TableColumn>Opsi</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {
                                    shift.map((el, i) => {
                                        return <TableRow key={i}>
                                            <TableCell>{el.shift}</TableCell>
                                            <TableCell>{moment(el.start_hours).format("HH:mm")}</TableCell>
                                            <TableCell>{moment(el.end_hours).format("HH:mm")}</TableCell>
                                            <TableCell>
                                                <Button size="sm" onPress={() => setOpen({
                                                    open: true,
                                                    data: el
                                                })}>Ubah</Button>
                                            </TableCell>
                                        </TableRow>
                                    })
                                }


                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>
            <ModalShift open={open} setOpen={setOpen} getShift={getShift} />
        </>
    )
}