import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { CategoryMenu, IMenu } from "../../../../electron/types";
import { IResponses } from "../../../../electron/lib/responses";
import { convertRupiah, convertToInteger } from "../../../lib/utils";
import DataTableCustom from "../../../components/datatable/DataTableCustom";
import { TableColumn } from "react-data-table-component";
import { Trash } from "lucide-react";
import { Chip } from "@heroui/chip";



export default function AddMenu() {
    const [list_menu, setListMenu] = useState<IMenu[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loading_btn, setLoadingBtn] = useState<boolean>(false);

    const [list_category, setListCategory] = useState<CategoryMenu[]>([]);

    const [price_sell, setPriceSell] = useState<string>("");
    const [price_profit, setPriceProfit] = useState<string>("");
    const [modal, setModal] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [category, setCategory] = useState<string>("");

    const [id, setId] = useState<number | null>(null);

    const columns: TableColumn<IMenu>[] = [
        {
            name: "Nama Menu",
            selector: row => row.name,
            cell: row => <button onClick={() => handleUpdate(row)} type="button" className="text-blue-500 hover:underline">{row.name}</button>
        },
        {
            name: "Harga",
            selector: row => row.category_menu?.name || "-",
            cell: row => <Chip size="sm">{row.category_menu?.name}</Chip>
        },
        {
            name: "Harga",
            selector: row => `Rp. ${convertRupiah(row.price.toString())}`,
        },
        {
            name: "Harga Jual",
            selector: row => `Rp. ${convertRupiah(row.price.toString())}`,
        },
        {
            name: "Modal",
            selector: row => `Rp. ${convertRupiah(row.price_modal.toString())}`,
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

    const handleDelete = async (row: IMenu) => {
        if (confirm(`Apakah anda yakin ingin menghapus "${row.name}"?`)) {
            try {
                if (row.id) {
                    const res = await window.api.delete_menu(row.id);

                    if (res.status) {
                        toast.success("Menu berhasil dihapus");
                        getMenu();
                    } else {
                        toast.error(res.detail_message || "Gagal menghapus Menu");
                    }
                } else {
                    toast.error("ID Menu tidak ada.");
                }

            } catch (err) {
                toast.error(`Error deleting menu: ${err}`);
            }
        }
    }

    const handleUpdate = async (row: IMenu) => {
        try {
            if (!row.id) {
                toast.error("ID Menu tidak ditemukan.");
            }

            setPriceProfit(convertRupiah(row.price_profit.toString()));
            setPriceSell(convertRupiah(row.price.toString()))
            setModal(convertRupiah(row.price_modal.toString()))
            setName(row.name)
            setCategory((row.category_menu?.id || 0).toString())
            setId(row.id || null);

        } catch (err) {
            toast.error(`Error updating menu: ${err}`);
        }
    }

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

    const getMenu = async () => {
        setLoading(true)
        try {
            const res: IResponses<IMenu[]> = await window.api.menu_list("all");

            if (res.status && res.data) {
                setLoading(false)
                setListMenu(res.data);
            } else {
                toast.error(`Failed to fetch menu list: ${res.detail_message}`);
            }
        } catch (err) {
            setLoading(false)
            toast.error(`Error fetching menus: ${err}`);
        }
    }

    const deleteFieldValue = () => {
        setPriceProfit("");
        setPriceSell("");
        setModal("");
        setName("");
        setCategory("");
    }


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingBtn(true)
        const data = Object.fromEntries(new FormData(e.currentTarget)) as { name: string, price_sell: string, price_modal: string, price_profit: string }

        console.log(data.price_profit)

        data.price_sell = convertToInteger(price_sell).toString()
        data.price_modal = convertToInteger(modal).toString()
        data.price_profit = convertToInteger(price_profit).toString()

        const send_data = {
            name: name,
            price: convertToInteger(data.price_sell),
            price_modal: convertToInteger(data.price_modal),
            price_profit: convertToInteger(data.price_profit),
            categoryMenuId: parseInt(category)
        }

        try {
            let res;

            if (id) {
                console.log(id, send_data)
                res = await window.api.update_menu(id, send_data);
            } else {
                res = await window.api.add_menu(send_data);
            }
            console.log("res", res);

            if (res.status) {
                setLoadingBtn(false)
                toast.success(`Menu berhasil ${id ? "diubah" : "ditambahkan"}`);
                getMenu();
                deleteFieldValue();
                setId(null)
            } else {
                setLoadingBtn(false)
                toast.error(res.detail_message || "Gagal menambahkan Menu");
            }
        } catch (err) {
            setLoadingBtn(false)
            toast.error(`Gagal menambahkan Menu: ${err}`);
        }
    }


    const calculateDetail = () => {
        const sell = convertToInteger(price_sell)
        const modal_clean = convertToInteger(modal);

        if (!modal_clean || !sell) {
            setPriceProfit("0")
        }

        const total = sell - modal_clean
        setPriceProfit(convertRupiah(total.toString()));
    }

    useEffect(() => {
        getMenu();
        getCategory();
    }, [])

    useEffect(() => {
        calculateDetail();
    }, [price_sell, modal])

    return (
        <>
            <Form className="grid gap-5 w-full" validationBehavior="native" onSubmit={onSubmit}>
                <Card>
                    <CardHeader className="font-bold">Tambah Menu</CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <div className="grid gap-3">
                                    <Input
                                        isRequired
                                        label="Nama Menu"
                                        name="name"
                                        errorMessage={"Silakan isi kolom ini."}
                                        placeholder="Masukan Nama Menu disini"
                                        type="text"
                                        onValueChange={setName}
                                        value={name}
                                    />
                                    <Input
                                        isRequired
                                        startContent={"Rp."}
                                        label="Harga"
                                        onValueChange={(e) => setPriceSell(convertRupiah(e))}
                                        value={price_sell}
                                        name="price"
                                        errorMessage={"Silakan isi kolom ini."}
                                        placeholder="Masukan Harga disini"
                                        type="text"
                                    />
                                    <Select label="Pilih Kategori Menu" selectedKeys={[category]} onChange={(e) => setCategory(e.target.value)} isDisabled={loading} isRequired defaultSelectedKeys={"regular"}>
                                        {
                                            list_category.map((category) => (
                                                <SelectItem key={category.id}>{category.name}</SelectItem>
                                            ))
                                        }

                                    </Select>
                                </div>
                            </div>
                            <div className="w-full h-fit p-4 bg-muted-foreground/20 rounded-md grid gap-4">
                                <div className="flex flex-col gap-3">
                                    <h3 className="font-bold">Detail Menu</h3>
                                    <Divider />
                                    <Input
                                        isRequired
                                        startContent={"Rp."}
                                        label="Modal"
                                        name="price_modal"
                                        errorMessage={"Silakan isi kolom ini."}
                                        placeholder="Masukan Modal disini"
                                        type="text"
                                        onValueChange={(e) => setModal(convertRupiah(e))}
                                        value={modal}
                                    />
                                    <Input
                                        readOnly
                                        startContent={"Rp."}
                                        label="Keuntungan"
                                        name="price"
                                        errorMessage={"Silakan isi kolom ini."}
                                        type="text"
                                        value={price_profit}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter className="justify-end">
                        <Button type="submit" isLoading={loading_btn}>Simpan Perubahan</Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader className="font-bold">List Menu</CardHeader>
                    <CardBody>

                        <DataTableCustom columns={columns} data={list_menu} progressPending={loading} pagination />
                    </CardBody>
                </Card>
            </Form>
        </>
    )
}