import { useEffect, useState } from "react";
import { toast } from "sonner"
import { ILogs } from "../../../../../electron/types";
import moment from "moment-timezone";
import { Chip } from "@heroui/chip";
import { LoadingComponent } from "../../../../components/datatable/DataTableCustom";

export default function Logs() {
    const [loading, setLoading] = useState<boolean>(false);
    const [logs, setLogs] = useState<ILogs[]>([]);

    const getLogs = async () => {
        setLoading(true);
        try {
            const res = await window.api.get_logging();
            setLoading(false);
            if (res.status && res.data) {
                setLogs(res.data);
            } else {
                toast.error("Gagal mengambil Data Logging")
            }
        } catch (err) {
            setLoading(false);
            toast.error(`Terjadi kesalahan ${err}`);
        }
    }

    useEffect(() => {
        getLogs();
    }, [])

    return (
        <>
            <div className="bg-slate-500/50 rounded-md p-3">
                <div className="flex flex-col gap-3">
                    <div>
                        <h3 className="font-bold text-lg">Log ({logs.length})</h3>
                    </div>

                    <div className="w-full bg-black text-white p-3 rounded-md max-h-[300px] min-h-[300px] flex flex-col gap-3 overflow-auto">
                        {
                            loading ? <LoadingComponent /> : logs.map((el, i) => {
                                return <p key={i}><b>({moment(el.created_at).format("DD/MM/YYYY HH:mm:ss")})</b> - <Chip color={el.status === "LOG" ? "default" : el.status === "WARNING" ? "warning" : "danger"}>{el.status}</Chip>  {el.activity}</p>
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    )
}