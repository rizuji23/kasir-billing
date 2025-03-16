import CashierName from "./api/CashierName";
import HardwareApi from "./api/HardwareApi";
import PrinterApi from "./api/PrinterApi";
import ServerApi from "./api/ServerApi";

export default function ApiSection() {
    return (
        <>
            <div className="grid gap-5 mb-10">
                <CashierName />
                <ServerApi />
                <PrinterApi />
                <HardwareApi />
            </div>
        </>
    )
}