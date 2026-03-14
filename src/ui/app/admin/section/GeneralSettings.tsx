import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IResponses } from "../../../../electron/lib/responses";
import { Settings } from "../../../../electron/types";

export default function GeneralSettings() {
    const [increment, setIncrement] = useState("60");
    const [loading, setLoading] = useState(false);

    const fetchSettings = async () => {
        try {
            const res = await window.api.get_setting("LOSS_PLAY_INCREMENT") as IResponses<Settings | null>;
            if (res.code === 200 && res.data) {
                setIncrement(res.data.content || "60");
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await window.api.save_url("LOSS_PLAY_INCREMENT", "Time Billing Increment (Menit)", increment);
            if (res.code === 200) {
                toast.success("Pengaturan berhasil disimpan");
            } else {
                toast.error(res.detail_message || "Gagal menyimpan pengaturan");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat menyimpan pengaturan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <div className="flex flex-col gap-4 max-w-md">
            <h2 className="text-xl font-bold">Pengaturan Play Loss</h2>
            <div className="flex flex-col gap-2">
                <Input
                    label="Interval Billing Baru (Menit)"
                    placeholder="Contoh: 60"
                    type="number"
                    value={increment}
                    onChange={(e) => setIncrement(e.target.value)}
                    description="Waktu dalam menit sebelum tagihan baru ditambahkan secara otomatis pada mode Loss. Default 60 menit."
                />
            </div>
            <Button color="primary" onPress={handleSave} isLoading={loading}>
                Simpan
            </Button>
        </div>
    );
}
