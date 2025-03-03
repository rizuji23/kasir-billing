import { useState, useEffect } from "react";
import { Chip } from "@heroui/chip";

export default function HoursShift() {
    const [time, setTime] = useState(new Date());
    const [shift, setShift] = useState<string>("");

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
                <Chip size="lg" classNames={{ content: "font-bold" }}>
                    {formatTime(time)}
                </Chip>
            </div>
            <div className="self-center">
                <Chip size="lg" color="success">
                    <span>Shift: </span><span className="font-bold">{shift}</span>
                </Chip>
            </div>
            <button onClick={() => window.api.test_struk()}>Test Struk</button>
        </>
    );
}
