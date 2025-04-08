import { Tab, Tabs } from "@heroui/tabs";
import MainLayout from "../../components/MainLayout";
import AddMenu from "./sections/AddMenu";
import CategoryMenu from "./sections/CategoryMenu";
import ApiSection from "./sections/ApiSection";
import AboutPage from "./sections/About";
import NetworkSection from "./sections/networks/Network";

export default function SettingsPage() {
    return (
        <>
            <MainLayout>
                <Tabs aria-label="Options">
                    <Tab key="add_menu" title="Tambah Menu">
                        <AddMenu />
                    </Tab>
                    <Tab key="category_menu" title="Kategori Menu">
                        <CategoryMenu />
                    </Tab>
                    {/* <Tab key="voucher" title="Voucher">
                        <VoucherSection />
                    </Tab> */}
                    {/* <Tab key={"member"} title="Member">
                        <MemberPage />
                    </Tab> */}
                    <Tab key="network" title="Jaringan">
                        <NetworkSection />
                    </Tab>
                    <Tab key="api" title="API">
                        <ApiSection />
                    </Tab>
                    <Tab key="about" title="Tentang Aplikasi">
                        <AboutPage />
                    </Tab>
                </Tabs>
            </MainLayout>
        </>
    )
}