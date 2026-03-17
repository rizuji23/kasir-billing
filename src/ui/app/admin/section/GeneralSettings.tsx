import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IResponses } from "../../../../electron/lib/responses";
import { Settings } from "../../../../electron/types";

export default function GeneralSettings() {
    // Use undefined to distinguish "not loaded yet" from "empty string"
    const [siangMinutes, setSiangMinutes] = useState<string | undefined>(undefined);
    const [siangPrice, setSiangPrice] = useState<string | undefined>(undefined);
    const [malamMinutes, setMalamMinutes] = useState<string | undefined>(undefined);
    const [malamPrice, setMalamPrice] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchSettings = async () => {
        setFetching(true);
        try {
            const fetchSetting = async (id: string, defaultVal: string): Promise<string> => {
                const res = await window.api.get_setting(id) as IResponses<Settings | null>;
                if (res.code === 200 && res.data) {
                    return res.data.content || defaultVal;
                }
                return defaultVal;
            };

            const [sm, sp, mm, mp] = await Promise.all([
                fetchSetting("LOSS_RATE_SIANG_MINUTES", "2"),
                fetchSetting("LOSS_RATE_SIANG_PRICE", "6000"),
                fetchSetting("LOSS_RATE_MALAM_MINUTES", "2"),
                fetchSetting("LOSS_RATE_MALAM_PRICE", "6000"),
            ]);

            setSiangMinutes(sm);
            setSiangPrice(sp);
            setMalamMinutes(mm);
            setMalamPrice(mp);

        } catch (error) {
            console.error("Failed to fetch settings:", error);
            toast.error("Gagal memuat pengaturan dari database.");
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await window.api.save_url("LOSS_RATE_SIANG_MINUTES", "Interval Loss Shift Siang (Menit)", siangMinutes || "2");
            await window.api.save_url("LOSS_RATE_SIANG_PRICE", "Harga Loss Shift Siang", siangPrice || "6000");
            await window.api.save_url("LOSS_RATE_MALAM_MINUTES", "Interval Loss Shift Malam (Menit)", malamMinutes || "2");
            await window.api.save_url("LOSS_RATE_MALAM_PRICE", "Harga Loss Shift Malam", malamPrice || "6000");

            toast.success("Pengaturan berhasil disimpan");
        } catch (error) {
            toast.error("Terjadi kesalahan saat menyimpan pengaturan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    if (fetching) {
        return (
            <div className="flex flex-col gap-6 max-w-2xl animate-pulse">
                <div className="h-7 w-72 bg-default-200 rounded" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-40 bg-default-200 rounded-lg" />
                    <div className="h-40 bg-default-200 rounded-lg" />
                </div>
                <div className="h-10 w-24 bg-default-200 rounded" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            <h2 className="text-xl font-bold">Pengaturan Tarif Play Loss (Count-Up)</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3 p-4 border rounded-lg">
                    <h3 className="font-bold">Shift Siang</h3>
                    <Input
                        label="Interval Shift Siang (Menit)"
                        placeholder="Contoh: 2"
                        type="number"
                        value={siangMinutes ?? ""}
                        onChange={(e) => setSiangMinutes(e.target.value)}
                        description="Berapa menit sekali tagihan bertambah (Siang)."
                    />
                    <Input
                        label="Tarif Interval Siang (Rp)"
                        placeholder="Contoh: 6000"
                        type="number"
                        value={siangPrice ?? ""}
                        onChange={(e) => setSiangPrice(e.target.value)}
                        description="Nominal tagihan setiap interval (Siang)."
                    />
                </div>

                <div className="flex flex-col gap-3 p-4 border rounded-lg">
                    <h3 className="font-bold">Shift Malam</h3>
                    <Input
                        label="Interval Shift Malam (Menit)"
                        placeholder="Contoh: 2"
                        type="number"
                        value={malamMinutes ?? ""}
                        onChange={(e) => setMalamMinutes(e.target.value)}
                        description="Berapa menit sekali tagihan bertambah (Malam)."
                    />
                    <Input
                        label="Tarif Interval Malam (Rp)"
                        placeholder="Contoh: 6000"
                        type="number"
                        value={malamPrice ?? ""}
                        onChange={(e) => setMalamPrice(e.target.value)}
                        description="Nominal tagihan setiap interval (Malam)."
                    />
                </div>
            </div>
            <Button color="primary" onPress={handleSave} isLoading={loading}>
                Simpan
            </Button>
        </div>
    );
}

