import { Tab, Tabs } from "@heroui/tabs";
import MainLayout from "../../components/MainLayout";
import ReportAll from "./section/ReportAll";
import RincianReport from "./section/RincianReport";
import BilliardReport from "./section/BilliardReport";
import CafeBilling from "./section/CafeBilling";
import ResetReport from "./section/ResetReport";

export default function ReportPage() {
    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-3">
                    <Tabs aria-label="Options">
                        <Tab key="all" title="Semua">
                            <ReportAll />
                        </Tab>
                        <Tab key="rincian_transaksi" title="Rincian Transaksi">
                            <RincianReport />
                        </Tab>
                        <Tab key="rincian_billiard" title="Rincian Transaksi Billiard">
                            <BilliardReport />
                        </Tab>
                        <Tab key="rincian_cafe" title="Rincian Transaksi Cafe">
                            <CafeBilling />
                        </Tab>
                        <Tab key={"reset"} title="Rincian Reset">
                            <ResetReport />
                        </Tab>
                    </Tabs>
                </div>
            </MainLayout>
        </>
    )
}