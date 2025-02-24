import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { MonitorUp } from "lucide-react";

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
                        <div className="bg-slate-500/50 rounded-md p-3">
                            <div className="flex flex-col gap-3">
                                <div>
                                    <h3 className="font-bold text-lg">Log</h3>
                                </div>
                                <div className="w-full bg-black text-white p-3 rounded-md max-h-[300px] min-h-[300px] overflow-auto">
                                    <p>{"<"}2021-10-10 12:00:00{">"} Initial Release</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}