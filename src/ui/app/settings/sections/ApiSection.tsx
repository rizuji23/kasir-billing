import CashierName from "./api/CashierName";
import HardwareApi from "./api/HardwareApi";
import Logs from "./api/Logs";
import OtherSettings from "./api/OtherSettings";
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
                <OtherSettings />
                <Logs />
            </div>
        </>
    )
}
