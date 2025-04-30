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
    paket: PaketPrice[] | undefined
}

export default function useBooking({ open, setOpen, table, add_duration = false }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, table: TableBilliard, add_duration?: boolean }): UseBookingResult {
    const [data_booking, setDataBooking] = useState<IDataBookingInput>({
        type_play: "REGULAR",
        name: "",
        type_price: "REGULAR",
        duration: "0",
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
    }

    const handleItemPrice = async (duration: string) => {
        const durations = Number(duration);
        if (!durations || isNaN(durations) || durations <= 0) {
            setItemPrice([]);
            setSubtotal(0);
            setDurationBilling(0);
            return;
        }

        const startTime = moment().tz("Asia/Jakarta");
        const newPrices = [];

        for (let i = 0; i < durations; i++) {
            const startSlot = startTime.clone().add(i, "hours");
            const endSlot = startSlot.clone().add(1, "hours");

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
        try {
            const durations = Number(duration_billing);

            if (add_duration) {
                if (item_price.length === 0) {
                    toast.error("Silahkan untuk isi terlebih dahulu durasi.");
                    return;
                }
            }

            if (data_booking.type_play === "REGULAR") {
                if (item_price.length === 0) {
                    toast.error("Silahkan untuk isi terlebih dahulu durasi.");
                    return;
                }

                if (!durations || isNaN(durations) || durations <= 0) {
                    toast.error("Durasi tidak boleh kosong atau minus.");
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

            const data = {
                item_price: item_price,
                subtotal: subtotal,
                data_booking: data_booking
            }

            if (data_booking.type_customer === "PAKET") {
                data['data_booking'].id_paket_price = selected_paket;
                data['data_booking'].id_paket_segment = selected_segment;
                data['data_booking'].duration = selected_data_paket?.duration.toString() || "0"
            }

            console.log(data)

            const res = await window.api.booking_regular({ ...data, add_duration: add_duration });
            console.log("res.status", res)
            if (res.status) {
                toast.success(`Booking pada ${table.name} berhasil dilakukan`)
                setOpen(false);
                tableList.getTables();
                clearState();
            } else {
                toast.error(`Booking pada ${table.name} gagal dilakukan`);
            }
        } catch (err) {
            toast.error(`Kesalahan dalam pemeriksaan: ${err}`);
        }
    }

    const lossChange = async () => {
        const startTime = moment().tz("Asia/Jakarta");
        const endSlot = startTime.clone().add(15, "minutes");

        const price = await getPrice(endSlot);

        if (price) {
            setItemPrice([{
                price,
                duration: 1,
                start_duration: startTime.toDate(),
                end_duration: endSlot.toDate(),
            }]);
            setSubtotal(price);
            setDurationBilling(1);
        }
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
    }, [open, data_booking.type_price, duration_billing]);

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
        }
    }, [open, data_booking.type_play])

    useEffect(() => {
        if (open === true) {
            clearState();
        }
    }, [data_booking.type_customer])

    return { data_booking, setDataBooking, type_price, item_price, handleItemPrice, voucher, setVoucher, subtotal, checkOut, selected_paket, selected_segment, setSelectedDataPaket, setSelectedPaket, setSelectedSegment, paket, paket_segment }
}