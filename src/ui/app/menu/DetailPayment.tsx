import { Card, CardBody } from "@heroui/card"
import BoxItem from "./BoxItem"
import { Divider } from "@heroui/divider"
import { Input } from "@heroui/input"
import moment from "moment-timezone"
import { Button } from "@heroui/button"
import { UseCartResult } from "../../hooks/useCart"
import cart_empty from "../../assets/cart_empty.png"
import { convertRupiah, convertToInteger } from "../../lib/utils"
import { useState } from "react"
import { Radio, RadioGroup } from "@heroui/radio"

export default function DetailPayment({ cart }: { cart: UseCartResult }) {
    const [cash, setCash] = useState<string>("");
    const [payment_method, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "QRIS" | string>("CASH");

    const total = cart.getTotal();
    const change = Math.max(0, Number(cash) - total);

    return (
        <>
            <Card>
                <CardBody>
                    <div className="grid gap-3">
                        <div className="min-h-[300px] max-h-[300px] overflow-auto pe-3">
                            <div className="grid gap-1">

                                {
                                    cart.cart.length === 0 ? <div className="flex flex-col gap-3 p-5 mt-10">
                                        <div className="flex justify-center">
                                            <img src={cart_empty} className="w-[100px]" alt="" />
                                        </div>
                                        <h3 className="text-center font-bold">Cart Kosong</h3>
                                    </div> :
                                        cart.cart.map((item, i) => {
                                            return <BoxItem key={i} item={item} cart={cart} />
                                        })
                                }
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-lg font-bold">Detail Pembayaran:</h3>
                                <p className="text-xs">Tanggal Pembelian: {moment().tz("Asia/Jakarta").format("DD/MM/YYYY hh:mm A")}</p>
                                <Input
                                    isRequired
                                    label="Jumlah Pembayaran"
                                    name="uang_cash"
                                    className=" mt-5"
                                    errorMessage={cash === "" ? "Silakan isi kolom ini." : ""}
                                    placeholder="Masukan jumlah pembayaran disini..."
                                    type="text"
                                    value={convertRupiah(cash)}
                                    onValueChange={(e) => {
                                        const rawValue = e.replace(/\D/g, "");
                                        setCash(rawValue);
                                    }}
                                />
                                <RadioGroup value={payment_method} onValueChange={(e) => setPaymentMethod(e)} orientation="horizontal" isRequired className="mt-2" label="Cara Pembayaran">
                                    <Radio classNames={{ label: "text-sm" }} value={"CASH"}>Cash</Radio>
                                    <Radio classNames={{ label: "text-sm" }} value={"TRANSFER"}>Transfer</Radio>
                                    <Radio classNames={{ label: "text-sm" }} value={"QRIS"}>QRIS</Radio>
                                </RadioGroup>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3>Total:</h3>
                                <h1 className="text-xl font-bold">Rp. {convertRupiah(cart.getTotal().toString())}</h1>
                            </div>
                            <Divider className="my-2" />
                            <div className="flex flex-col gap-1">
                                <h3>Kembalian:</h3>
                                <h1 className="text-xl font-bold">
                                    Rp. {convertRupiah(change.toString())}
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button className="bg-blue-500" isLoading={cart.loading} onPress={() => {
                                if (cart.cart.length === 0) {
                                    alert("Cart masih kosong");
                                    return;
                                } else if (cash === "") {
                                    alert("Silakan isi uang cash terlebih dahulu");
                                    return;
                                } else if (confirm("Apakah anda yakin ingin memesan?")) {
                                    cart.checkout(convertToInteger(cash), payment_method);
                                    setCash("");
                                    return;
                                }
                            }}>Pesan</Button>
                            <Button color="danger" onPress={() => {
                                if (confirm("Apakah anda yakin ingin membatalkan pesanan?")) {
                                    cart.cancelOrder();
                                }
                            }}>Batalkan</Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}