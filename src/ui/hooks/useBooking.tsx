import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IPriceType, TableBilliard } from "../../electron/types";
import { toast } from "sonner";
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
    checkOut: () => Promise<void>
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
    })

    const tableList = useTableBilliard();

    const [type_price, setTypePrice] = useState<IPriceType[]>([]);
    const [item_price, setItemPrice] = useState<IItemDuration[]>([]);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [voucher, setVoucher] = useState<string>("");
    const [duration_billing, setDurationBilling] = useState<number>(0);

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
                    duration: i + 1,
                    start_duration: startSlot.toDate(),
                    end_duration: endSlot.toDate(),
                });
            }
        }

        setItemPrice(newPrices);
        setDurationBilling(durations);
        setSubtotal(newPrices.reduce((sum, item) => sum + item.price, 0));
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
            if (item_price.length === 0) {
                toast.error("Silahkan untuk isi terlebih dahulu durasi.");
            }

            if (!durations || isNaN(durations) || durations <= 0) {
                toast.error("Durasi tidak boleh kosong atau minus.");
            }

            const data = {
                item_price: item_price,
                subtotal: subtotal,
                data_booking: data_booking
            }

            console.log(data)

            if (data_booking.type_play === "REGULAR") {
                const res = await window.api.booking_regular({ ...data, add_duration: add_duration });

                if (res.status) {
                    toast.success(`Booking pada ${table.name} berhasil dilakukan`)
                    setOpen(false);
                    tableList.getTables();
                    clearState();
                } else {
                    toast.error(`Booking pada ${table.name} gagal dilakukan`);
                }
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
        }
    }, [open]);

    useEffect(() => {
        if (open === true) {
            if (data_booking.type_play === "LOSS") {
                lossChange();
            } else {
                clearState();
            }
        }
    }, [open, data_booking.type_play])

    return { data_booking, setDataBooking, type_price, item_price, handleItemPrice, voucher, setVoucher, subtotal, checkOut }
}