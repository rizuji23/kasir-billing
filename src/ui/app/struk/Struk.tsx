import { Instagram } from "lucide-react";
import logo from "../../assets/logo-print.png";
import { useEffect, useState } from "react";
import { Struk } from "../../../electron/types";
import moment from "moment-timezone";
import { convertRupiah } from "../../lib/utils";

function StripDivider() {
    return <p className="text-xs !font-black font-bold">---------------------------------</p>
}

export default function StrukView() {
    const [struk, setStruk] = useState<Struk | null>(null);

    useEffect(() => {
        window.api.onPrintStruk((data) => {
            console.log("data", data)
            setStruk(data)
        });

        return () => {
            window.api.removePrintStruk();
        }
    }, []);

    return (
        <>
            {
                struk ? <div className="w-[219px] !font-mono !font-black">
                    <div className="grid gap-0.5">
                        <div className="flex flex-col gap-3 px-2 pt-3">
                            <div className="flex justify-center">
                                <img src={logo} alt="" className="w-[150px]" />
                            </div>
                            <p className="text-center text-xs !font-black ">Jl. Papandayan No.110, Kota Kulon, Kec. Garut Kota, Kabupaten Garut, Jawa Barat 44114 <br /> 08987395378</p>
                        </div>
                        <StripDivider />
                        <div className="text-xs !font-black grid gap-1">
                            <div className="flex justify-between">
                                <p>Struk ID:</p>
                                <p className="text-end">{struk.id_struk}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Tanggal:</p>
                                <p className="text-end">{moment(struk.updated_at).format("DD-MM-YYYY HH:mm")}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Nama Kustomer:</p>
                                <p className="text-end">{struk.name}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Kasir:</p>
                                <p className="text-end">Test</p>
                            </div>
                            {
                                struk.bookingId?.table.name ? <div className="flex justify-between">
                                    <p>Table Name:</p>
                                    <p className="text-end">{struk.bookingId?.table.name || "-"}</p>
                                </div> : <></>
                            }

                        </div>
                        <StripDivider />
                        {
                            struk.type_struk === "TABLE" && (
                                <>
                                    <p className="text-xs !font-black text-center">*Biling Item*</p>
                                    <div className="flex flex-col gap-1 py-2 text-center">
                                        {
                                            (struk.bookingId?.detail_booking || []).map((el, i) => {
                                                return <p className="text-xs !font-black" key={i}>{moment(el.end_duration).format("HH:mm:ss")} = Rp. {convertRupiah(el.price.toString() || "0")}</p>
                                            })
                                        }
                                    </div>
                                    <div className="text-xs !font-black grid gap-1">
                                        <div className="flex justify-between">
                                            <p>Total Durasi:</p>
                                            <p className="text-end">{struk.bookingId?.duration || "0"} Jam</p>
                                        </div>
                                    </div>
                                    <StripDivider />
                                </>
                            )
                        }
                        <p className="text-xs !font-black text-center">*Cafe Item*</p>
                        <div className="text-xs !font-black grid gap-1.5 py-2">
                            {
                                struk.type_struk === "TABLE" ? (struk.bookingId?.order_cafe || []).map((el, i) => {
                                    return <div className="flex justify-between" key={i}>
                                        <div className="flex flex-col">
                                            <p>{el.menucafe.name}</p>
                                            <p>{el.qty} x @ {convertRupiah(el.menucafe.price.toString() || "0")}</p>
                                        </div>
                                        <p className="text-end self-end">Rp. {convertRupiah(el.total.toString() || "0")}</p>
                                    </div>
                                }) : (struk.orderId || []).map((el, i) => {
                                    return <div className="flex justify-between" key={i}>
                                        <div className="flex flex-col">
                                            <p>{el.menucafe.name || "-"}</p>
                                            <p>{el.qty || "0"} x @ {convertRupiah(el.menucafe.price.toString() || "0")}</p>
                                        </div>
                                        <p className="text-end self-end">Rp. {convertRupiah(el.subtotal.toString() || "0")}</p>
                                    </div>
                                })
                            }
                        </div>
                        <StripDivider />
                        {
                            struk.type_struk === "TABLE" && (
                                <>
                                    <div className="text-xs !font-black grid gap-1.5">
                                        <div className="flex justify-between">
                                            <p>Billing: </p>
                                            <p className="text-end">Rp. {convertRupiah(struk.total_billing?.toString() || "0")}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p>Cafe: </p>
                                            <p className="text-end">Rp. {convertRupiah(struk.total_cafe?.toString() || "0")}</p>
                                        </div>
                                    </div>
                                    <StripDivider />
                                </>
                            )
                        }
                        <div className="text-xs !font-black grid gap-1.5">
                            <div className="flex justify-between">
                                <p>Total: </p>
                                <p className="text-end">Rp. {convertRupiah(struk.total?.toString() || "0")}</p>
                            </div>
                        </div>
                        <StripDivider />
                        <div className="text-xs !font-black grid gap-1.5">
                            <div className="flex justify-between">
                                <p className="capitalize">{struk.payment_method.toLowerCase()}: </p>
                                <p className="text-end">Rp. {convertRupiah(struk.cash.toString() || "0")}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Kembali: </p>
                                <p className="text-end">Rp. {convertRupiah(struk.change?.toString() || "0")}</p>
                            </div>
                        </div>
                        <StripDivider />
                        <div className="flex justify-center">
                            <div className="flex gap-1">
                                <Instagram className="w-4 h-4 self-center" />
                                <p className="text-xs !font-black">cozypool</p>
                            </div>
                        </div>
                        <p className="text-xs !font-black text-center my-3">Terimakasih sudah berkunjung!</p>
                    </div>
                </div> : <></>
            }
        </>
    )
}