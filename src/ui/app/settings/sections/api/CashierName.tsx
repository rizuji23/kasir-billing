import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';

export default function CashierName() {
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleSaveCashier = async () => {
        setLoading(true)
        try {
            const res = await window.api.cashier_name(name);

            setLoading(false);
            if (res.status) {
                toast.success("Nama Kasir berhaasil diubah");
            }

        } catch (err) {
            setLoading(false);
            toast.error(`Terjadi kesalahan: ${err}`);
        }
    }

    const getCashierName = async () => {
        try {
            const res = await window.api.get_cashier_name();

            if (res.status && res.data) {
                setName(res.data.content || "")
            }

        } catch (err) {
            console.error(err);
            return;
        }
    }

    useEffect(() => {
        getCashierName();
    }, [])

    return (
        <>
            <Card>
                <CardHeader className="font-bold">Nama Kasir</CardHeader>
                <CardBody>
                    <div className="grid gap-3">
                        <Input
                            isRequired
                            label="Nama Kasir"
                            name="kasir_name"
                            errorMessage={"Silakan isi kolom ini."}
                            placeholder="Masukan Nama Kasir disini"
                            type="text"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                    </div>
                </CardBody>
                <CardFooter className="justify-end">
                    <Button onPress={handleSaveCashier} isLoading={loading}>Simpan Perubahan</Button>
                </CardFooter>
            </Card>
        </>
    )
}