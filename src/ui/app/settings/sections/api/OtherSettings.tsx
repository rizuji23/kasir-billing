import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { addToast } from "@heroui/react";
import { Bell, MessageCircleWarning, Printer } from "lucide-react";

export default function OtherSettings() {
    const handleTestNotif = () => {
        addToast({
            title: "Lantai Satu",
            description: "Order 1 mie goreng",
            icon: <MessageCircleWarning />
        });
    }

    return (
        <>
            <Card>
                <CardHeader className="font-bold">Pengaturan Lainnya</CardHeader>
                <CardBody>
                    <div className="flex gap-3">
                        <Button onPress={handleTestNotif} startContent={<Bell className="w-4 h-4" />}>Test Notifikasi Chat</Button>
                        <Button startContent={<Printer className="w-4 h-4" />} onPress={() => window.api.test_struk()}>Test Struk</Button>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}