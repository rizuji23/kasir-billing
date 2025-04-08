import { useState } from "react";
import { ICart } from "../../electron/types";
import toast from 'react-hot-toast';
import { useWebsocketData } from "../components/context/WebsocketContext";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const Swals = withReactContent(Swal)

export interface UseCartResult {
    cart: ICart[];
    addToCart: (item: ICart) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, action: "increase" | "decrease" | "set", qty?: string) => void;
    getTotal: () => number;
    getChange: (cash: number) => number;
    cancelOrder: () => void;
    checkout: (cash: number, payment_method: string, name: string, no_meja: string, keterangan: string) => void;
    loading: boolean;
}

export default function useCart(): UseCartResult {
    const [cart, setCart] = useState<ICart[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const socket = useWebsocketData();

    const cancelOrder = () => {
        setCart([]);
    }

    const addToCart = (item: ICart) => {
        setCart((prevState) => {
            const existingItem = prevState.find((i) => i.id === item.id);

            if (existingItem) {
                return prevState.map((i) =>
                    i.id === item.id ? { ...i, qty: String(Number(i.qty) + 1), subtotal: (i.price * (Number(i.qty) + 1)) } : i
                );
            } else {
                return [...prevState, { ...item, qty: "1", subtotal: item.price }];
            }
        });
    };

    const removeFromCart = (id: number) => {
        setCart((prevState) => prevState.filter((i) => i.id !== id));
    };

    const updateQuantity = (id: number, action: "increase" | "decrease" | "set", qty?: string) => {
        setCart((prevState) =>
            prevState.map((i) => {
                if (i.id !== id) return i;

                let newQty = Number(i.qty);

                if (action === "increase") {
                    newQty += 1;
                } else if (action === "decrease") {
                    newQty = Math.max(1, newQty - 1); // Prevent going below 1
                } else if (action === "set" && qty) {
                    newQty = Math.max(1, Number(qty)); // Ensure valid quantity
                }

                return { ...i, qty: String(newQty), subtotal: i.price * newQty };
            })
        );
    };

    const getTotal = (): number => {
        return cart.reduce((total, item) => total + item.subtotal, 0);
    };

    const getChange = (cash: number): number => {
        return cash - getTotal();
    };

    const checkout = async (cash: number, payment_method: "CASH" | "TRANSFER" | "QRIS" | string, name: string, no_meja: string, keterangan: string) => {
        setLoading(true);

        if (name.length === 0) {
            toast.error("Nama pemesan wajib diisi.");
            setLoading(false)
            return;
        }

        if (no_meja.length === 0) {
            toast.error("Nomor meja wajib diisi.");
            setLoading(false)
            return;
        }

        try {
            const res = await window.api.checkout_menu(cash, cart, payment_method, name, no_meja, keterangan);
            setLoading(false)
            if (res.status && res.data) {
                cancelOrder()
                toast.success(res.detail_message || "");

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

                if (socket.connectedKitchens.length === 0) {
                    window.api.show_message_box("warning", "Dapur tidak terkoneksi, maka struk dapur tidak akan terkirim.");
                }

            } else {
                toast.error(`Gagal melakukan pembayaran: ${res.detail_message}`);
            }
        } catch (err) {
            setLoading(false)
            toast.error(`Kesalahan dalam pemeriksaan: ${err}`);
        }
    }


    return { cart, addToCart, removeFromCart, updateQuantity, getTotal, getChange, cancelOrder, checkout, loading };
}