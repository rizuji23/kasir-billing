import { Tab, Tabs } from "@heroui/tabs";
import MainLayout from "../../components/MainLayout";
import AddMenu from "./sections/AddMenu";
import CategoryMenu from "./sections/CategoryMenu";
import VoucherSection from "./sections/Voucher";
import ApiSection from "./sections/ApiSection";

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
                    <Tab key="voucher" title="Voucher">
                        <VoucherSection />
                    </Tab>
                    <Tab key="api" title="API">
                        <ApiSection />
                    </Tab>
                    <Tab key="about" title="Tentang Aplikasi">
                    </Tab>
                </Tabs>
            </MainLayout>
        </>
    )
}