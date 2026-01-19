import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { useEffect, useState } from "react";

export default function AboutPage() {
    const [currentVersion, setCurrentVersion] = useState<string>("");

    useEffect(() => {
        const curr = window.update.get_version();
        setCurrentVersion(curr);
    }, []);

    return (
        <>
            <div className="grid gap-5">
                <Card>
                    <CardHeader><h3 className="font-bold text-lg">Versi Aplikasi:</h3></CardHeader>
                    <Divider />
                    <CardBody>
                        <div className="grid gap-3">
                            <div className="flex flex-col gap-3">
                                <div className="grid gap-3">
                                    <Chip color="success" classNames={{ content: "font-bold" }}>v{currentVersion}</Chip>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
