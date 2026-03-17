import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IPriceType, PaketPrice, PaketSegment, TableBilliard } from "../../electron/types";
import toast from 'react-hot-toast';
import moment from "moment-timezone";
import { useTableBilliard } from "../components/context/TableContext";

interface IDataBookingInput {
    type_play: string,
    name: string,
    type_price: string,
    duration: string,
    blink: string,
    id_table: string,
    id_booking?: string,
    type_customer?: string,
    kode_member?: string,
    id_paket_segment?: string,
    id_paket_price?: string,
}

interface IItemDuration {
    price: number;
    duration: number;
    start_duration: Date;
    end_duration: Date;
}

export interface UseBookingResult {
    data_booking: IDataBookingInput,
    setDataBooking: Dispatch<SetStateAction<IDataBookingInput>>,
    type_price: IPriceType[],
    item_price: IItemDuration[],
    handleItemPrice: (duration: string) => Promise<void>,
    voucher: string,
    setVoucher: Dispatch<SetStateAction<string>>,
    subtotal: number,
    checkOut: () => Promise<void>,
    setSelectedSegment: Dispatch<SetStateAction<string>>,
    setSelectedPaket: Dispatch<SetStateAction<string>>,
    setSelectedDataPaket: Dispatch<SetStateAction<PaketPrice | null>>,
    selected_segment: string,
    selected_paket: string,
    paket_segment: PaketSegment[],
    paket: PaketPrice[] | undefined,
    loading: boolean
}

export default function useBooking({ open, setOpen, table, add_duration = false }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, table: TableBilliard, add_duration?: boolean }): UseBookingResult {
    const [data_booking, setDataBooking] = useState<IDataBookingInput>({
        type_play: "REGULAR",
        name: "",
        type_price: "REGULAR",
        duration: "1",
        blink: "tidak",
        id_table: "",
        id_booking: "",
        type_customer: "BIASA",
        kode_member: "",
    })

    const tableList = useTableBilliard();

    const [selected_segment, setSelectedSegment] = useState<string>("");
    const [selected_paket, setSelectedPaket] = useState<string>("");

    const [selected_data_paket, setSelectedDataPaket] = useState<PaketPrice | null>(null);

    const [paket_segment, setPaketSegment] = useState<PaketSegment[]>([]);
    const [paket, setPaket] = useState<PaketPrice[] | undefined>([]);

    const [type_price, setTypePrice] = useState<IPriceType[]>([]);
    const [item_price, setItemPrice] = useState<IItemDuration[]>([]);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [voucher, setVoucher] = useState<string>("");
    const [duration_billing, setDurationBilling] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

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

    const getTypePrice = async () => {
        try {
            const res = await window.api.get_price_type();
            if (Array.isArray(res.data)) {
                console.log(res)
                setTypePrice(res.data);
            }
        } catch (err) {
            toast.error(`Kesalahan dalam pemeriksaan: ${err}`);
        }
    }

    const clearState = () => {
        setDataBooking((prevState) => ({
            ...prevState,
            duration: "",
        }))
        setItemPrice([]);
        setSubtotal(0);
        setDurationBilling(0);
        setSelectedDataPaket(null);
        setSelectedPaket("");
        setSelectedSegment("");
        handleItemPrice("");
    }

    const handleItemPrice = async (duration: string, forcedType?: string) => {
        const typePlay = forcedType || data_booking.type_play;
        const durations = Number(duration);

        // Immediate clear to avoid stale data during async fetches
        setItemPrice([]);
        setSubtotal(0);

        setLoading(true);
        try {
            if (typePlay === "LOSS") {
                const durationsValue = Number(duration);
                if (!durationsValue || isNaN(durationsValue) || durationsValue <= 0) {
                    setItemPrice([]);
                    setSubtotal(0);
                    setDurationBilling(0);
                    return;
                }

                setLoading(true);
                const currentTime = moment().tz("Asia/Jakarta");
                const currentShiftStr = await window.api.get_current_shift();
                const isSiang = currentShiftStr.data?.toLowerCase() === "siang" || currentShiftStr.data?.toLowerCase() === "pagi";

                const minutesKey = isSiang ? "LOSS_RATE_SIANG_MINUTES" : "LOSS_RATE_MALAM_MINUTES";
                const priceKey = isSiang ? "LOSS_RATE_SIANG_PRICE" : "LOSS_RATE_MALAM_PRICE";

                const [rateSetting, priceSetting] = await Promise.all([
                    window.api.get_setting(minutesKey),
                    window.api.get_setting(priceKey)
                ]);

                // Fallback to 1 minute for LOSS unless specified
                const incrementMinutes = rateSetting.data ? parseInt(rateSetting.data.content || "1") : 1;
                const priceValue = priceSetting.data ? parseInt(priceSetting.data.content || "6000") : 6000;

                console.log(`[LOSS_UI] Key=${minutesKey}, Value=${incrementMinutes}, Shift=${currentShiftStr.data}`);

                const newPrices: IItemDuration[] = [];
                let lastEndDuration = currentTime;

                // @ts-ignore
                if (add_duration && table.bookings?.[0]?.detail_booking?.[0]) {
                    // @ts-ignore
                    const rawLastEnd = moment(table.bookings[0].detail_booking[0].end_duration).tz("Asia/Jakarta");
                    // KEY FIX: If Regular expired in the past, start LOSS from NOW (not from the past end time).
                    // This ensures the timer always starts from 00:00:00 when adding LOSS.
                    lastEndDuration = moment.max(currentTime, rawLastEnd);
                }

                for (let i = 0; i < durationsValue; i++) {
                    const startSlot = lastEndDuration.clone().add(i * incrementMinutes, "minutes");
                    const endSlot = startSlot.clone().add(incrementMinutes, "minutes");

                    newPrices.push({
                        price: priceValue,
                        duration: 1,
                        start_duration: startSlot.toDate(),
                        end_duration: endSlot.toDate(),
                    });
                }

                setItemPrice(newPrices);
                setDurationBilling(durationsValue);
                setSubtotal(newPrices.reduce((sum, item) => sum + item.price, 0));
                return;
            }

            const startTime = moment().tz("Asia/Jakarta");
            const newPrices = [];

            for (let i = 0; i < durations; i++) {
                const startSlot = startTime.clone().add(i * 60, "minutes");
                const endSlot = startSlot.clone().add(60, "minutes");

                const price = await getPrice(startSlot);
                if (price) {
                    newPrices.push({
                        price,
                        duration: 1,
                        start_duration: startSlot.toDate(),
                        end_duration: endSlot.toDate(),
                    });
                }
            }

            setItemPrice(newPrices);
            setDurationBilling(durations);

            if (data_booking.type_customer !== "PAKET") {
                setSubtotal(newPrices.reduce((sum, item) => sum + item.price, 0));
            } else {
                if (!selected_data_paket?.price) {
                    toast.error("Durasi paket tidak ditemukan");
                    return;
                }
                setSubtotal(selected_data_paket.price)
            }
        } finally {
            setLoading(false);
        }

    };

    const getPrice = async (time: moment.Moment) => {
        try {
            const formattedTime = time.format("HH:mm:ss");
            const res = await window.api.get_price(data_booking.type_price, formattedTime);

            if (res.status && res.data) {
                return res.data.price;
            }

            return null;
        } catch (err) {
            toast.error(`Kesalahan dalam pemeriksaan: ${err}`);
        }
    };

    const checkOut = async () => {
        if (loading) {
            console.log("[CHECKOUT_UI] Already loading, ignoring click.");
            return;
        }

        console.log(`[CHECKOUT_UI] Starting checkout. Type: ${data_booking.type_play}, Items: ${item_price.length}, Subtotal: ${subtotal}`);



        setLoading(true);
        try {
            const durations = Number(duration_billing);

            if (data_booking.type_play === "REGULAR") {
                if (item_price.length === 0) {
                    toast.error("Silahkan untuk isi terlebih dahulu durasi.");
                    return;
                }

                if (!durations || isNaN(durations) || durations <= 0) {
                    toast.error("Durasi tidak boleh kosong atau minus.");
                    setLoading(false);
                    return;
                }
            }

            if (data_booking.type_customer === "PAKET") {
                if (selected_paket.length === 0) {
                    toast.error("Paket tidak boleh kosong.");
                    return;
                }

                if (selected_segment.length === 0) {
                    toast.error("Paket Segment tidak boleh kosong.");
                    return;
                }
            }

            // For LOSS mode: regenerate timestamps RIGHT NOW at submission time.
            // This prevents the "stale timestamp" bug where the timer starts from N seconds
            // elapsed because the user waited N seconds in the drawer before clicking submit.
            let freshItemPrice = item_price;
            if (data_booking.type_play === "LOSS" && add_duration) {
                const now = moment().tz("Asia/Jakarta");
                // @ts-ignore
                const rawLastEnd = table.bookings?.[0]?.detail_booking?.[0]
                    // @ts-ignore
                    ? moment(table.bookings[0].detail_booking[0].end_duration).tz("Asia/Jakarta")
                    : now;
                // Use max(now, lastEnd): if Regular already expired, start from now
                const lossStart = moment.max(now, rawLastEnd);

                // Read increment from existing item_price (price/duration already correct from handleItemPrice)
                const incrementMinutes = item_price.length > 0
                    ? Math.round((new Date(item_price[0].end_duration).getTime() - new Date(item_price[0].start_duration).getTime()) / 60000)
                    : 1;

                freshItemPrice = item_price.map((el, i) => ({
                    ...el,
                    start_duration: lossStart.clone().add(i * incrementMinutes, "minutes").toDate(),
                    end_duration: lossStart.clone().add((i + 1) * incrementMinutes, "minutes").toDate(),
                }));

                console.log(`[CHECKOUT_LOSS] Refreshed ${freshItemPrice.length} segment(s) start from: ${lossStart.toLocaleString()}`);
            }

            const data = {
                item_price: freshItemPrice,
                subtotal: subtotal,
                data_booking: data_booking
            }

            if (data_booking.type_customer === "PAKET") {
                data['data_booking'].id_paket_price = selected_paket;
                data['data_booking'].id_paket_segment = selected_segment;
                data['data_booking'].duration = selected_data_paket?.duration.toString() || "0"
            }

            console.log("Submit Data:", data);

            const res = await window.api.booking_regular({ ...data, add_duration: add_duration });
            console.log("Checkout Response:", res);
            if (res.status) {
                toast.success(`Berhasil menambahkan durasi pada ${table.name}`)
                setOpen(false);
                tableList.getTables();
                clearState();
            } else {
                toast.error(`Gagal menambahkan durasi pada ${table.name}`);
            }
        } catch (err) {
            toast.error(`Kesalahan dalam pemeriksaan: ${err}`);
        } finally {
            setLoading(false);
        }
    }

    const lossChange = async () => {
        setDataBooking(prevState => ({ ...prevState, duration: "1" }));
        setDurationBilling(1);
        handleItemPrice("", "LOSS");
    }

    const getPaketDuration = async () => {
        console.log("selected_data_paket", selected_data_paket)
        if (data_booking.type_customer === "PAKET") {
            if (!selected_data_paket?.duration) {
                toast.error("Paket durasi tidak ditemukan");
                return;
            }

            const data_duration = selected_data_paket.duration;

            return await handleItemPrice(data_duration.toString());
        } else {
            return;
        }
    }

    useEffect(() => {
        setPaket(paket_segment.filter((el) => el.id_paket_segment === selected_segment)[0]?.paketPrice);
    }, [selected_segment]);

    useEffect(() => {
        const paket_segment_data = paket_segment.filter((el) => el.id_paket_segment === selected_segment)[0]?.paketPrice

        if (!paket_segment_data) {
            setSelectedDataPaket(null);
            return;
        }
        console.log(paket_segment_data.filter((el) => el.id_paket_price === selected_paket)[0])
        setSelectedDataPaket(paket_segment_data.filter((el) => el.id_paket_price === selected_paket)[0]);
    }, [selected_paket]);

    useEffect(() => {
        if (open === true) {
            getPaketDuration();
        }

    }, [open, selected_data_paket]);

    useEffect(() => {
        if (open) {
            handleItemPrice(duration_billing.toString());
        }
    }, [open, data_booking.type_price, data_booking.type_play, duration_billing]);

    useEffect(() => {
        if (open === true) {
            getTypePrice();
            setDataBooking((prevState) => ({
                ...prevState,
                id_table: table.id_table
            }))
            getPaketSegment();
        }
    }, [open]);

    useEffect(() => {
        if (open === true) {
            if (data_booking.type_play === "LOSS") {
                lossChange();
            } else {
                clearState();
            }
        } else {
            clearState();
            setSubtotal(0);
        }
    }, [open, data_booking.type_play])

    useEffect(() => {
        if (open === true) {
            clearState();
        }
    }, [data_booking.type_customer])

    return { data_booking, setDataBooking, type_price, item_price, handleItemPrice, voucher, setVoucher, subtotal, checkOut, selected_paket, selected_segment, setSelectedDataPaket, setSelectedPaket, setSelectedSegment, paket, paket_segment, loading }
}