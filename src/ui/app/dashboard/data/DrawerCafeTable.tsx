import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Booking, IMenu, OrderCafe, TableBilliard } from "../../../../electron/types";
import { Drawer, DrawerContent } from "@heroui/drawer";
import { Divider } from "@heroui/divider";
import { convertRupiah } from "../../../lib/utils";
import Select from 'react-select'
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { PlusCircle } from "lucide-react";
import { IResponses } from "../../../../electron/lib/responses";
import toast from 'react-hot-toast';
import InputQty from "../../../components/InputQty";

interface IOrderData {
    id_menu: number,
    price: number,
    qty: string,
    total: number,
    id_booking?: string
}

export default function DrawerCafeTable({ open, setOpen, table }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, table: TableBilliard }) {
    const [booking_data, setBookingData] = useState<Booking | null>(null);
    const [list_menu, setListMenu] = useState<{ value: string, label: string }[]>([]);
    const [menu, setMenu] = useState<IMenu[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loading_btn, setLoadingBtn] = useState<boolean>(false);

    const [order_cafe, setOrderCafe] = useState<OrderCafe[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [keterangan, setKeterangan] = useState<string>("");

    const [order_data, setOrderData] = useState<IOrderData>({
        id_menu: 0,
        price: 0,
        qty: "0",
        total: 0,
        id_booking: ""
    });

    const [selected_menu, setSelectedMenu] = useState<{ label: string, value: string } | null>(null)

    const handleMenu = (e: string) => {
        console.log(e);
        const filter_data = menu.filter((el) => Number(e) === el.id);
        console.log("filter_data", filter_data)
        if (filter_data.length !== 0) {
            setOrderData((prevState) => ({
                ...prevState,
                id_menu: filter_data[0].id || 0,
                price: filter_data[0].price,
                qty: "1",
                total: filter_data[0].price
            }))
        } else {
            toast.error("Menu tidak ditemukan.");
        }
    }

    const getMenu = async () => {
        setLoading(true)
        try {
            const res: IResponses<IMenu[]> = await window.api.menu_list("all");
            if (res.status && res.data) {
                setLoading(false)
                setListMenu(res.data.map((el) => {
                    return { value: el.id as unknown as string, label: `${el.name} (Rp. ${convertRupiah(el.price.toString())})` }
                }));
                setMenu(res.data);
            } else {
                toast.error(`Gagal mengambil daftar menu: ${res.detail_message}`);
            }
        } catch (err) {
            setLoading(false)
            toast.error(`Terjadi kesalahan saat mengambil menu: ${err}`);
        }
    }

    const getMenuTable = async () => {
        setLoading(true);
        try {
            const res = await window.api.list_menu_table(table.id_table) as unknown as IResponses<TableBilliard>;
            console.log("RES", res);
            setLoading(false);
            if (res.status && res.data) {
                if (Array.isArray(res.data.bookings) && res.data.bookings.length) {
                    const data_order = res.data.bookings[0].order_cafe || []
                    setOrderCafe(data_order);
                    setTotal(data_order.reduce((acc, item) => acc + item.total, 0));
                }
            } else {
                toast.error(`Terjadi Kesalahan: ${res.detail_message} `)
            }
        } catch (err) {
            setLoading(false)
            toast.error(`Terjadi kesalahan saat mengambil menu: ${err}`);
        }
    }

    useEffect(() => {
        if (open === true) {
            if (Array.isArray(table.bookings) && table.bookings.length !== 0) {
                const data = table.bookings[0];
                setBookingData(data);
            }

            getMenu();
            getMenuTable();
        }
    }, [open]);

    const handleChangeQty = (qtys: string) => {
        const qty = Number(qtys);

        if (!qty || isNaN(qty) || qty <= 0) {
            setOrderData((prevState) => ({
                ...prevState,
                qty: "",
            }))
            return;
        }

        const total = order_data.price * qty;

        setOrderData((prevState) => ({
            ...prevState,
            total: total
        }))
    }

    const onSubmit = async () => {
        setLoadingBtn(true);
        try {
            if (await window.api.confirm()) {
                const qty = Number(order_data.qty);
                if (!qty || isNaN(qty) || qty <= 0) {
                    toast.error("Jumlah tidak boleh kosong atau kurang dari 1");
                    setLoadingBtn(false);
                    return;
                }

                if (order_data.id_menu === 0) {
                    toast.error("Menu wajib diisi");
                    setLoadingBtn(false);
                    return;
                }

                if (!Array.isArray(table.bookings)) {
                    toast.error("Booking tidak ditemukan.");
                    setLoadingBtn(false);
                    return;
                }

                const data = { ...order_data, id_booking: table.bookings[0].id_booking, keterangan: keterangan };

                const res = await window.api.checkout_menu_table(data);
                console.log("res", res)
                setLoadingBtn(false);
                if (res.status) {
                    toast.success("Pesanan berhasil disimpan");
                    await getMenu();
                    await getMenuTable();
                    setOrderData((prevState) => ({
                        ...prevState,
                        id_menu: 0,
                        price: 0,
                        qty: "0",
                        total: 0,
                    }));
                    setSelectedMenu(null);
                    setKeterangan("");

                    const kitchenStatus = res.data.kitchen?.status;

                    if (kitchenStatus === "OFFLINE") {
                        window.api.show_message_box(
                            "warning",
                            "Pesanan berhasil disimpan, namun dapur sedang offline.\nPesanan akan dikirim ulang saat dapur online.",
                        );
                    }

                    if (kitchenStatus === "REJECTED") {
                        window.api.show_message_box(
                            "error",
                            "Pesanan ditolak oleh dapur. Silakan hubungi staf dapur.",
                        );
                    }

                    // if (socket.connectedKitchens.length === 0) {
                    //     window.api.show_message_box("warning", "Dapur tidak terkoneksi, maka struk dapur tidak akan terkirim.");
                    // }
                }
            } else {
                setLoadingBtn(false);
            }
        } catch (err) {
            setLoadingBtn(false)
            toast.error(`Terjadi kesalahan saat tambah menu: ${err}`);
        }
    }

    const handleQtyItem = async (id_order: number, type_qty: "plus" | "minus") => {
        try {
            const res = await window.api.menu_table_qty(id_order, type_qty);

            if (res.status) {
                await getMenu();
                await getMenuTable();
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan saat tambah/kurang menu: ${err}`);
        }
    }

    return (
        <>
            <Drawer isOpen={open} onOpenChange={setOpen} size="xl">
                <DrawerContent>
                    <div className="grid gap-4 p-6">
                        <div className="flex flex-col gap-3">
                            <h3 className="font-bold">Cafe ({table.name})</h3>
                            <Divider />
                        </div>
                        <div className="grid gap-2">
                            <span className="text-sm font-semibold">Informasi Pemesan:</span>
                            <div className="p-3 bg-default-100 rounded-md grid gap-2">
                                <div className="">
                                    <small>Nama Pemesan:</small>
                                    <p className="text-sm font-bold">{booking_data?.name || "-"}</p>
                                </div>
                            </div>
                            <span className="text-sm font-semibold">List Pesanan Cafe:</span>
                            <div className="p-3 bg-default-100 rounded-md grid gap-2 overflow-y-auto max-h-[200px]">
                                {
                                    order_cafe.length === 0 ? <h3 className="text-sm font-bold text-center py-3">List Pesanan Kosong.</h3> :
                                        order_cafe.map((el, i) => {
                                            return <div className="flex flex-col gap-3" key={i}>
                                                <div className="flex justify-between">
                                                    <div className="flex flex-col gap-1">
                                                        <p className="font-bold">{el.menucafe.name}</p>
                                                        <small>Rp. {convertRupiah(el.menucafe.price.toString() || "0")}</small>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <p className="text-sm font-bold self-center">Rp. {convertRupiah(el.total.toString())}</p>
                                                        <InputQty value={el.qty.toString()} onPressMinus={() => handleQtyItem(el.id, "minus")} onPressPlus={() => handleQtyItem(el.id, "plus")} show_plus={false} />
                                                    </div>
                                                </div>
                                                <Divider />
                                            </div>
                                        })
                                }
                            </div>
                            <div className="p-3 bg-default-100 rounded-md grid gap-2">
                                <div className="">
                                    <small>Total Menu: </small>
                                    <p className="text-sm font-bold">Rp. {convertRupiah(total.toString() || "0")}</p>
                                </div>
                            </div>
                        </div>
                        <Divider />
                        <div className="grid gap-2">
                            <span className="text-sm font-semibold">Tambah Pesanan:</span>
                            <div className="flex flex-col gap-3">
                                <Select className="react-select-container" classNamePrefix="react-select" options={list_menu} value={selected_menu} onChange={(e) => {
                                    handleMenu((e as unknown as { label: string, value: string })?.value || "")
                                    setSelectedMenu(e as unknown as { label: string, value: string });
                                }} placeholder="Pilih menu..." isLoading={loading} />
                                <Textarea label="Masukkan Keterangan" onChange={(e) => setKeterangan(e.target.value)} value={keterangan} />
                                <Input label={"Jumlah"} isRequired placeholder="Masukan jumlah pesanan..." onChange={(e) => {
                                    setOrderData((prevState) => ({
                                        ...prevState,
                                        qty: e.target.value
                                    }));
                                    handleChangeQty(e.target.value);
                                }} value={order_data.qty} type="number" />
                                <Input label="Total" isRequired readOnly startContent={"Rp. "} value={convertRupiah(order_data.total.toString())} />
                                <div className="flex justify-end">
                                    <Button onPress={onSubmit} isLoading={loading_btn} className="bg-secondary-200" startContent={<PlusCircle className="w-4 h-4" />}>Tambah</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    )
}
