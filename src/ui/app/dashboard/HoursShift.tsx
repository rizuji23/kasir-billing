import { useState, useEffect } from "react";
import { Chip } from "@heroui/chip";
import { Check, RefreshCcw, X } from "lucide-react";
import { useTableBilliard } from "../../components/context/TableContext";

export default function HoursShift() {
    const [time, setTime] = useState(new Date());
    const [shift, setShift] = useState<string>("");
    const tableList = useTableBilliard();

    useEffect(() => {
        const interval = setInterval(async () => {
            setTime(new Date());

            const res = await window.api.get_current_shift();
            setShift(res.data || "Uknown");
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", { hour12: true });
    };

    return (
        <>
            <div className="self-center">
                {
                    tableList.status_machine?.status === undefined ? <Chip size="md" color="danger" startContent={<X className="w-4 h-4" />}>
                        <span className="font-bold">Box Tidak Dikenal</span>
                    </Chip> : tableList.status_machine.status === "CONNECTED" ? <Chip size="md" color="success" startContent={<Check className="w-4 h-4" />}>
                        <span className="font-bold">Box Tersambung</span>
                    </Chip> : tableList.status_machine.status === "RECONNECTED" ? <Chip size="md" color="warning" startContent={<RefreshCcw className="w-4 h-4" />}>
                        <span className="font-bold">Box Sedang Reconnecting</span>
                    </Chip> : <Chip size="md" color="danger" startContent={<X className="w-4 h-4" />}>
                        <span className="font-bold">Box Tidak Tersambung</span>
                    </Chip>
                }
            </div>
            <div className="self-center">
                <Chip size="md" color="success">
                    <span>Shift: </span><span className="font-bold">{!shift ? "Loading..." : shift}</span>
                </Chip>
            </div>
            <div className="self-center">
                <Chip size="md" classNames={{ content: "font-bold" }}>
                    {formatTime(time)}
                </Chip>
            </div>
            <button onClick={() => window.api.test_struk()}>Test Struk</button>
        </>
    );
}
