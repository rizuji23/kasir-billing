import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Booking, DetailBooking, IPaymentData, OrderCafe, TableBilliard } from "../../electron/types";
import { Selection } from "@heroui/react";
import { convertToInteger } from "../lib/utils";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const Swals = withReactContent(Swal)

interface IPaymentTableDetail {
    table: TableBilliard,
    booking: Booking,
}

export interface UsePaymentTableResult {
    list_booking: DetailBooking[],
    list_cafe: OrderCafe[],
    setSelectedBooking: Dispatch<SetStateAction<Selection>>,
    setSelectedCafe: Dispatch<SetStateAction<Selection>>,
    selected_booking: Selection,
    selected_cafe: Selection,
    total: TotalPayment | null,
    change: number,
    payment_cash: string,
    setPaymentCash: Dispatch<SetStateAction<string>>,
    handlePaymentChange: (payment_cash: string) => void,
    payment_method: "CASH" | "TRANSFER" | "QRIS" | string,
    setPaymentMethod: Dispatch<SetStateAction<"CASH" | "TRANSFER" | "QRIS" | string>>,
    duration: number;
    setIsSplitBill: Dispatch<SetStateAction<boolean>>,
    is_split_bill: boolean;
    setNameSplit: Dispatch<SetStateAction<string>>,
    name_split: string;
    checkOut: () => Promise<void>;
    loading: boolean,
    printStruk: () => Promise<void>;
    setDiscountCafe: Dispatch<SetStateAction<string>>,
    setDiscountBilling: Dispatch<SetStateAction<string>>,
    discount_cafe: string,
    discount_billing: string
}

export interface UsePaymentTable {
    getDetailBookingTable: () => Promise<void>;
    detail: IPaymentTableDetail | null,
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>;
    table: TableBilliard
}

interface TotalPayment {
    total_all: number;
    total_cafe: number;
    total_billing: number;
    subtotal_billing: number;
    subtotal_cafe: number;
    subtotal: number;
}

export default function usePaymentTable({ getDetailBookingTable, detail, open, setOpen, table }: UsePaymentTable): UsePaymentTableResult {
    const [list_booking, setListBooking] = useState<DetailBooking[]>([]);
    const [list_cafe, setListCafe] = useState<OrderCafe[]>([]);

    const [selected_booking, setSelectedBooking] = useState<Selection>(new Set([]));
    const [selected_cafe, setSelectedCafe] = useState<Selection>(new Set([]));
    const [is_split_bill, setIsSplitBill] = useState<boolean>(false);

    const [total, setTotal] = useState<TotalPayment | null>(null);
    const [payment_cash, setPaymentCash] = useState<string>("");

    const [discount_cafe, setDiscountCafe] = useState<string>("0");
    const [discount_billing, setDiscountBilling] = useState<string>("0");

    const [change, setChange] = useState<number>(0);

    const [payment_method, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "QRIS" | string>("CASH");
    const [duration, setDuration] = useState<number>(0);
    const [name_split, setNameSplit] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handlePaymentChange = (payment_cash: string) => {
        const rawValue = payment_cash.replace(/\D/g, "");
        setPaymentCash(rawValue);
        const total_all = total?.total_all;
        const cash = convertToInteger(rawValue);

        if (!total_all) {
            setChange(0);
            return;
        }

        if (!cash || isNaN(cash) || cash <= 0) {
            setChange(0);
            return;
        }

        const change_total = total_all - cash;

        if (change_total > 0) {
            setChange(0);
            return;
        }

        setChange(change_total)
    }


    const getTotalAll = async () => {
        const discount_cafe_percent = (Number(discount_cafe) || 0);
        const discount_billing_percent = (Number(discount_billing) || 0);

        const total_billing = list_booking.reduce((sum, item) => sum + item.price, 0);
        const total_cafe = list_cafe.reduce((sum, item) => sum + item.total, 0);

        const discount_billings = (total_billing * discount_billing_percent) / 100;
        const discount_cafes = (total_cafe * discount_cafe_percent) / 100;

        const subtotal_billing = total_billing;
        const subtotal_cafe = total_cafe;

        const subtotal_all = subtotal_billing + subtotal_cafe;

        const total_billing_after_discount = total_billing - discount_billings;
        const total_cafe_after_discount = total_cafe - discount_cafes;

        const total_all = total_billing_after_discount + total_cafe_after_discount;

        console.log({
            subtotal_billing,
            subtotal_cafe,
            subtotal_all,
            total_billing,
            total_cafe,
            discount_billings,
            discount_cafes,
            total_billing_after_discount,
            total_cafe_after_discount,
            total_all
        });

        // Menyimpan total dalam state
        setTotal({
            subtotal_billing,   // Menyimpan subtotal billing
            subtotal_cafe,      // Menyimpan subtotal cafe
            subtotal: subtotal_all,       // Menyimpan subtotal semua
            total_billing: total_billing_after_discount,
            total_cafe: total_cafe_after_discount,
            total_all
        });
    }

    // const getTotalSplit = () => {
    //     const selected_booking_data = Array.from(selected_booking);
    //     const selected_cafe_data = Array.from(selected_cafe);

    //     const data_booking = list_booking.filter((el) => selected_booking_data.includes(el.id.toString()));
    //     const data_cafe = list_cafe.filter((el) => selected_cafe_data.includes(el.id.toString()));


    //     const total_billing = data_booking.reduce((sum, item) => sum + item.price, 0);
    //     const total_cafe = data_cafe.reduce((sum, item) => sum + item.total, 0);
    //     const total_all = total_billing + total_cafe;
    //     console.log({
    //         total_billing,
    //         total_cafe,
    //         total_all
    //     })

    //     setTotal({
    //         total_billing,
    //         total_cafe,
    //         total_all
    //     })
    // }

    const checkOut = async () => {
        setLoading(true);
        try {
            const confirm = window.api.confirm();
            if (await confirm) {
                const data: IPaymentData = {
                    id_table: table.id_table,
                    id_booking: detail?.booking.id_booking || "",
                    total: total,
                    payment_cash: payment_cash,
                    change: Math.abs(change),
                    payment_method: payment_method,
                    is_split_bill: is_split_bill,
                    splitbill: null,
                    discount_billing: discount_billing,
                    discount_cafe: discount_cafe
                };

                if (is_split_bill === true) {
                    const selected_booking_data = Array.from(selected_booking);
                    const selected_cafe_data = Array.from(selected_cafe);

                    if (name_split.length === 0) {
                        toast.error("Nama tidak boleh kosong.");
                        return;
                    }

                    if (selected_booking_data.length === 0 || selected_cafe_data.length === 0) {
                        toast.error("Silahkan untuk pilih data billing/cafe terlebih dahulu sebelum membayar Split Bill");
                        return;
                    }

                    data.splitbill = {
                        selected_billing: selected_booking_data,
                        selected_cafe: selected_cafe_data,
                        name: name_split
                    }
                }

                if (!total) {
                    toast.error("Total kosong.");
                    setLoading(false);
                    return;
                }

                if (payment_cash.length === 0) {
                    toast.error("Jumlah pembayaran tidak boleh kosong.");
                    setLoading(false);
                    return;
                }

                const res = await window.api.payment_booking(data);
                setLoading(false);

                console.log("DAta", res);

                if (res.status && res.data) {
                    toast.success("Pembayaran berhasil dilakukan");
                    await getDetailBookingTable();
                    setOpen(false);

                    Swals.fire({
                        title: "Apakah ingin print struk lagi?",
                        icon: "info",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Iya"
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            await window.api.print_struk(res.data?.id_struk || "");
                        }
                    });
                } else {
                    toast.error("Pembayaran gagal dilakukan");
                }
            } else {
                setLoading(false);
            }

        } catch (err) {
            toast.error(`Error save payment_booking: ${err}`);
            setLoading(false);
        }
    }

    const printStruk = async () => {
        try {
            if (await window.api.confirm()) {
                const data: IPaymentData = {
                    id_table: table.id_table,
                    id_booking: detail?.booking.id_booking || "",
                    total: total,
                    payment_cash: payment_cash,
                    change: Math.abs(change),
                    payment_method: payment_method,
                    is_split_bill: is_split_bill,
                    splitbill: null,
                    discount_billing: discount_billing,
                    discount_cafe: discount_cafe
                };

                const res = await window.api.print_struk_temp(data);


                if (res.status) {
                    toast.success("Struk berhasil diprint");
                    await getDetailBookingTable();
                } else {
                    toast.error(res.detail_message || "Terjadi Kesalahan");
                }
            }
        } catch (err) {
            toast.error(`Error save print struk: ${err}`);
        }
    }

    useEffect(() => {
        if (open === true) {
            if (detail !== null) {
                const billing = detail.booking.detail_booking;
                const cafe = detail.booking.order_cafe;

                if (billing) {
                    setListBooking(billing);
                    setDuration(billing.length);
                }

                if (cafe) {
                    setListCafe(cafe);
                }
            }
        }
    }, [open, detail]);

    useEffect(() => {
        if (open === true) {
            getTotalAll();
            setSelectedBooking(new Set([]));
            setSelectedCafe(new Set([]));
            setIsSplitBill(false);
        }
    }, [open, list_booking, list_cafe, discount_billing, discount_cafe]);

    useEffect(() => {
        if (open === true) {
            const selected_booking_data = Array.from(selected_booking);
            const selected_cafe_data = Array.from(selected_cafe);

            if (selected_booking_data.length !== 0 || selected_cafe_data.length !== 0) {
                // getTotalSplit();
                setIsSplitBill(true);
            } else {
                setChange(0);
                setPaymentCash("");
                setIsSplitBill(false);
                getTotalAll();
            }
        }
    }, [selected_cafe, selected_booking]);

    return { list_booking, list_cafe, setSelectedBooking, setSelectedCafe, selected_cafe, selected_booking, total, change, payment_cash, setPaymentCash, handlePaymentChange, payment_method, setPaymentMethod, duration, setIsSplitBill, is_split_bill, setNameSplit, name_split, checkOut, loading, printStruk, setDiscountBilling, setDiscountCafe, discount_billing, discount_cafe };
}