import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { addToast } from "@heroui/react";
import { Bell, MessageCircleWarning, Printer } from "lucide-react";
import notif_sound from "../../../../assets/notification.wav";
import { useState } from "react";
import toast from "react-hot-toast";

export default function OtherSettings() {
    const [migrating, setMigrating] = useState(false);

    const handleTestNotif = () => {
        const sound = new Howl({
            src: [notif_sound],
            volume: 1
        });

        sound.play()
        addToast({
            title: "Chat Title",
            description: "Chat Description",
            icon: <MessageCircleWarning />
        });
    }

    const handleMigrateNow = async () => {
        setMigrating(true);
        try {
            const res = await window.api.migrate_now();
            if (res.status) {
                toast.success(res.detail_message || "Migration selesai");
            } else {
                toast.error(res.detail_message || "Migration gagal");
            }
        } catch (err) {
            toast.error(`Terjadi kesalahan saat migration: ${err}`);
        } finally {
            setMigrating(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="font-bold">Pengaturan Lainnya</CardHeader>
                <CardBody>
                    <div className="flex gap-3 flex-wrap">
                        <Button onPress={handleTestNotif} startContent={<Bell className="w-4 h-4" />}>Test Notifikasi Chat</Button>
                        <Button startContent={<Printer className="w-4 h-4" />} onPress={() => window.api.test_struk()}>Test Struk</Button>
                        <Button startContent={<MessageCircleWarning className="w-4 h-4" />} onPress={() => window.api.test_kitchen()}>Test Kitchen</Button>
                        <Button
                            color="warning"
                            variant="flat"
                            onPress={handleMigrateNow}
                            isLoading={migrating}
                        >
                            Migrate Database Sekarang
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}
