import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IPriceType } from "../../electron/types";
import { toast } from "sonner";
import moment from "moment-timezone";

interface IDataBookingInput {
    type_play: string,
    name: string,
    type_price: string,
    duration: string,
    blink: string
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
    subtotal: number
}

export default function useBooking({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }): UseBookingResult {
    const [data_booking, setDataBooking] = useState<IDataBookingInput>({
        type_play: "REGULAR",
        name: "",
        type_price: "REGULAR",
        duration: "0",
        blink: "tidak"
    })

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
                    duration: i + 1, // Ensure correct iteration count
                    start_duration: startSlot.toDate(),
                    end_duration: endSlot.toDate(),
                });

                console.log(`Iteration: ${i + 1}, Start: ${startSlot.format("HH:mm:ss")}, End: ${endSlot.format("HH:mm:ss")}, Price: ${price}`);
            } else {
                console.warn(`⚠️ Missing Price for ${startSlot.format("HH:mm:ss")}`);
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

    useEffect(() => {
        if (open) {
            handleItemPrice(duration_billing.toString());
        }
    }, [open, data_booking.type_price, duration_billing]);

    useEffect(() => {
        if (open === true) {
            getTypePrice();
        }
    }, [open])

    return { data_booking, setDataBooking, type_price, item_price, handleItemPrice, voucher, setVoucher, subtotal }
}