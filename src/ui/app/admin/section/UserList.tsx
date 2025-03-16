import { Card, CardBody } from "@heroui/card";
import { TableColumn } from "react-data-table-component";
import { User } from "../../../../electron/types";
import moment from "moment-timezone";
import { Button, Input } from "@heroui/react";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import DataTableCustom from "../../../components/datatable/DataTableCustom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@heroui/modal";
import { Form } from "@heroui/form";

function ModalUserForm({ open, setOpen, getUser }: {
    open: {
        open: boolean,
        row: User | undefined
    }, setOpen: Dispatch<SetStateAction<{
        open: boolean,
        row: User | undefined
    }>>,
    getUser: () => void
}) {
    const [data_user, setDataUser] = useState<{
        username: string,
        password: string,
        name: string
    }>({
        username: "",
        password: "",
        name: ""
    })

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const data = Object.fromEntries(new FormData(e.currentTarget));

            console.log("data", data)

            let res;

            if (!open.row) {
                res = await window.api.create_user(data as unknown as { name: string, password: string, username: string });
            } else {
                res = await window.api.update_user({ ...data, id_user: open.row.id } as unknown as { name: string, password: string, username: string, id_user: number })
            }

            setOpen({
                open: false,
                row: undefined
            })

            if (res.status) {
                toast.success(`User berhasil ${open.row ? "Diubah" : "Disimpan"}`)
                getUser();
            } else {
                toast.error(`${res.detail_message}`)
            }

        } catch (err) {
            toast.error(`Gagal menyimpan user: ${err}`)
        }
    }

    useEffect(() => {
        if (open.open === true) {
            if (open.row) {
                setDataUser({
                    username: open.row.username,
                    password: open.row.password,
                    name: open.row.name
                })
            }
        }
    }, [open]);

    return (
        <>
            <Modal isOpen={open.open} onOpenChange={(isOpen) => setOpen({
                open: isOpen,
                row: undefined
            })}>
                <ModalContent>
                    {(onClose) => (
                        <Form className="!block" onSubmit={onSubmit} validationBehavior="native">
                            <ModalHeader className="flex flex-col gap-1">{open.row ? "Ubah" : "Buat"} User</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-3">
                                    <Input label="Nama Lengkap" name="name" value={data_user.name} onChange={(e) => setDataUser((prev) => ({
                                        ...prev,
                                        name: e.target.value
                                    }))} isRequired placeholder="Masukan nama lengkap disini..." />
                                    <Input label="Username" value={data_user.username} onChange={(e) => setDataUser((prev) => ({
                                        ...prev,
                                        username: e.target.value
                                    }))} name="username" isRequired placeholder="Masukan username disini..." />
                                    <Input label="Password" value={data_user.password} onChange={(e) => setDataUser((prev) => ({
                                        ...prev,
                                        password: e.target.value
                                    }))} name="password" isRequired type="password" placeholder="Masukan password disini..." />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" type="button" onPress={onClose}>
                                    Kembali
                                </Button>
                                <Button color="primary" type="submit">
                                    {open.row ? "Ubah" : "Tambah"}
                                </Button>
                            </ModalFooter>
                        </Form>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default function UserList() {
    const [user, setUser] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<{
        open: boolean,
        row: User | undefined
    }>({
        open: false,
        row: undefined
    })

    const handleDeleteUser = async (id_user: number) => {
        try {
            if (await window.api.confirm()) {
                const res = await window.api.delete_user(id_user);

                if (res.status) {
                    toast.success("User berhasil dihapus");
                    getUser();
                } else {
                    toast.error(`${res.detail_message}`)
                }
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`)
        }
    }

    const columns: TableColumn<User>[] = [
        {
            name: "Nama Lengkap",
            selector: row => row.name,
        },
        {
            name: "Username",
            selector: row => row.username
        },
        {
            name: "Dibuat pada",
            selector: row => moment(row.created_at).format("DD/MM/YYYY HH:mm:ss")
        },
        {
            name: "Actions",
            cell: row => (
                <div className="flex gap-2">
                    <Button size="sm" color="default" onPress={() => setOpen({
                        open: true,
                        row: row
                    })} isIconOnly><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" color="danger" isIconOnly onPress={() => handleDeleteUser(row.id)}><Trash className="w-4 h-4" /></Button>
                </div>
            )
        }
    ]

    const getUser = async () => {
        setLoading(true)
        try {
            const res = await window.api.get_user();
            setLoading(false)
            if (res.status && res.data) {
                setUser(res.data);
            }

        } catch (err) {
            setLoading(false)
            toast.error(`Terjadi kesalahan: ${err}`)
        }
    }

    useEffect(() => {
        getUser()
    }, [])

    return (
        <>
            <Card>
                <CardBody>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-end">
                            <Button startContent={<PlusCircle className="w-4 h-4" />} onPress={() => setOpen({
                                open: true,
                                row: undefined
                            })}>Tambah User</Button>
                        </div>
                        <div>
                            <DataTableCustom columns={columns} data={user} pagination progressPending={loading} />
                        </div>
                    </div>
                </CardBody>
            </Card>
            <ModalUserForm open={open} setOpen={setOpen} getUser={getUser} />
        </>
    )
}