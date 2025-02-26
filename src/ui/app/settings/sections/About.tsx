import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { MonitorUp } from "lucide-react";
import Logs from "./api/Logs";

export default function AboutPage() {
    return (
        <>
            <Card>
                <CardBody>
                    <div className="grid gap-3">
                        <div className="bg-slate-500/50 rounded-md p-3">
                            <div className="flex flex-col gap-3">
                                <div>
                                    <h3 className="font-bold text-lg">Versi Aplikasi:</h3>
                                    <p>v.1.0.0 (Current)</p>
                                </div>
                                <Button color="primary" startContent={<MonitorUp className="w-4 h-4" />}>Check Update</Button>
                            </div>
                        </div>
                        <Logs />
                    </div>
                </CardBody>
            </Card>
        </>
    )
}