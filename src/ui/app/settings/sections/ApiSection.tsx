import HardwareApi from "./api/HardwareApi";
import PrinterApi from "./api/PrinterApi";
import ServerApi from "./api/ServerApi";

export default function ApiSection() {
    return (
        <>
            <div className="grid gap-5 mb-10">
                <ServerApi />
                <PrinterApi />
                <HardwareApi />
            </div>
        </>
    )
}