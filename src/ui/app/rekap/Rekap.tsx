import MainLayout from "../../components/MainLayout";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import moment from "moment-timezone";
import BoxRekap from "./components/BoxRekap";

export default function RekapPage() {
    return (
        <>
            <MainLayout>
                <div className="grid gap-5">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">Unduh Rekap Data Transaksi</h1>
                        <Chip variant="solid" color="success">Hari Ini: <span className="font-bold">{moment().format("DD/MM/YYYY")}</span></Chip>
                    </div>
                    <Divider />

                    <div className="grid grid-cols-2 gap-5">
                        <BoxRekap title="Rekap Penjualan Cafe" type_rekap={"rekap_penjualan_cafe"} />
                    </div>
                </div>
            </MainLayout>
        </>
    )
}