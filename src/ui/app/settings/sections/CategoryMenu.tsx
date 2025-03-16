import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { CirclePlus, Trash } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { CategoryMenu, IModalRow } from "../../../../electron/types";
import DataTableCustom from "../../../components/datatable/DataTableCustom";
import { TableColumn } from "react-data-table-component";

function ModalCategoryMenu({ open, setOpen, api }: {
    open: {
        open: boolean,
        row: CategoryMenu | null
    }, setOpen: Dispatch<SetStateAction<{
        open: boolean,
        row: CategoryMenu | null
    }>>,
    api: () => Promise<void>
}) {
    const [loading_btn, setLoadingBtn] = useState<boolean>(false);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>

        try {
            let res;

            if (open.row && open.row.id) {
                res = await window.api.update_category(data.category_name, open.row.id);
            } else {
                res = await window.api.add_category(data.category_name);
            }

            if (res.status) {
                setLoadingBtn(false)
                toast.success(`Kategori Menu berhasil ${open.row ? "diperbarui" : "ditambahkan"}`);
                api()
                setOpen({
                    open: false,
                    row: null
                })
            } else {
                toast.error(res.detail_message || "Gagal menambahkan Kategori Menu");
            }

        } catch (err) {
            setLoadingBtn(false)
            toast.error(`Gagal menambahkan Kategori Kategori Menu: ${err}`);
        }
    }

    const [name, setName] = useState<string>("");

    useEffect(() => {
        if (open.open === true) {
            setName(open.row ? open.row.name : "")
        }
    }, [open]);


    return <Modal isOpen={open.open} onOpenChange={(isOpen) => setOpen({
        open: isOpen,
        row: null
    })}>
        <Form validationBehavior="native" onSubmit={onSubmit}>
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
                                    value={name}
                                    onValueChange={setName}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Batalkan
                            </Button>
                            <Button color="primary" isLoading={loading_btn} type="submit">
                                Simpan Perubahan
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Form>
    </Modal>
}



export default function CategoryMenuPage() {
    const [open, setOpen] = useState<IModalRow<CategoryMenu>>({
        open: false,
        row: null
    })
    const [list_category, setListCategory] = useState<CategoryMenu[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const getCategory = async () => {
        setLoading(true)
        try {
            const res = await window.api.list_category()

            if (res.status && res.data) {
                setListCategory(res.data);
                setLoading(false)
            } else {
                toast.error(`Failed to fetch category list: ${res.detail_message}`);
            }
        } catch (err) {
            setLoading(false)
            console.log("err", err)
            toast.error(`Error fetching category: ${err}`);
        }
    }

    useEffect(() => {
        getCategory()
    }, [])

    const openEdit = (row: CategoryMenu) => {
        setOpen({
            open: true,
            row: row
        })
    }

    const handleDelete = async (row: CategoryMenu) => {
        if (confirm(`Apakah anda yakin ingin menghapus "${row.name}"?`)) {
            try {
                if (row.id) {
                    const res = await window.api.delete_category(row.id);

                    if (res.status) {
                        toast.success("Kategori berhasil dihapus");
                        getCategory();
                    } else {
                        toast.error(res.detail_message || "Gagal menghapus kategori");
                    }
                } else {
                    toast.error("ID Kategori tidak ada.");
                }

            } catch (err) {
                toast.error(`Error deleting category: ${err}`);
            }
        }
    }

    const columns: TableColumn<CategoryMenu>[] = [
        {
            name: "Name Kategori",
            selector: row => row.name,
            cell: row => <button onClick={() => openEdit(row)} className="text-blue-500 hover:underline text-md cursor-pointer">{row.name}</button>
        },
        {
            name: "Actions",
            cell: row => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        color="danger"
                        onPress={() => handleDelete(row)}
                        isIconOnly
                    >
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <>
            <Card>
                <CardHeader className="font-bold w-full !justify-between">
                    <span>List Kategori Menu</span>
                    <Button startContent={<CirclePlus className="w-4 h-4" />} onPress={() => setOpen({
                        open: true,
                        row: null
                    })}>Tambah Kategori</Button>
                </CardHeader>
                <CardBody>
                    <DataTableCustom columns={columns} data={list_category} progressPending={loading} />
                </CardBody>
            </Card>
            <ModalCategoryMenu open={open} setOpen={setOpen} api={getCategory} />
        </>
    )
}