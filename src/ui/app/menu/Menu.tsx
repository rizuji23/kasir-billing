import MainLayout from "../../components/MainLayout";
import { Input } from "@heroui/input";
import { Search } from "lucide-react";
import { Divider } from "@heroui/divider";
import { Tab, Tabs } from "@heroui/tabs";
import BoxMenu from "./BoxMenu";
import { useEffect, useState } from "react";
import { CategoryMenu, IMenu } from "../../../electron/types";
import { IResponses } from "../../../electron/lib/responses";
import { toast } from "sonner";
import { LoadingComponent } from "../../components/datatable/DataTableCustom";
import NotFound from "../../components/NotFound";
import DetailPayment from "./DetailPayment";
import { Skeleton } from "@heroui/react";
import useCart from "../../hooks/useCart";

export default function Menu() {
    const [list_menu, setListMenu] = useState<IMenu[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [list_category, setListCategory] = useState<CategoryMenu[]>([]);
    const [category, setCategory] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>("");

    const cart = useCart();

    const getCategory = async () => {
        setLoading(true)
        try {
            const res = await window.api.list_category()

            if (res.status && res.data) {
                setListCategory(res.data);
                setLoading(false)
            } else {
                toast.error(`Failed to fetch category list: ${res.detail_message}`);
            }
        } catch (err) {
            setLoading(false)
            toast.error(`Error fetching category: ${err}`);
        }
    }

    const getMenu = async (category: string) => {
        setLoading(true)
        try {
            const res: IResponses<IMenu[]> = await window.api.menu_list(category);
            if (res.status && res.data) {
                setLoading(false)
                setListMenu(res.data);
            } else {
                toast.error(`Gagal mengambil daftar menu: ${res.detail_message}`);
            }
        } catch (err) {
            setLoading(false)
            toast.error(`Terjadi kesalahan saat mengambil menu: ${err}`);
        }
    }

    const filteredData = list_menu.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        getMenu(category);
        getCategory();
    }, [category]);


    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">Menu</h1>
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                        <div className="col-span-2">
                            <div className="flex flex-col gap-3">
                                <div className="">
                                    <Input autoFocus onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} startContent={<Search className="w-5 h-5" />} placeholder="Cari menu disini..." />
                                </div>
                                {
                                    loading ? <div className="flex gap-3">
                                        {
                                            Array.from({ length: 5 }).map((_, i) => {
                                                return <Skeleton className="w-[80px] h-8 rounded-md" key={i} />
                                            })
                                        }
                                    </div> : <Tabs variant="light" selectedKey={category} onSelectionChange={(e) => setCategory(e.toString())}>
                                        <Tab key="all" title="Semua" className="capitalize" />
                                        {
                                            list_category.map((el) => {
                                                return <Tab key={el.id} title={el.name} className="capitalize" />
                                            })
                                        }
                                    </Tabs>
                                }
                                <Divider />
                                {loading ? <LoadingComponent /> :
                                    filteredData.length !== 0 ? <div className="gap-4 grid grid-cols-2 sm:grid-cols-4 max-h-[80vh] overflow-y-auto pe-3">
                                        {
                                            filteredData.map((item, index) => (
                                                <BoxMenu key={index} item={item} cart={cart} />
                                            ))
                                        }
                                    </div>
                                        : <NotFound title="Menu Tidak Ditemukan" />}
                            </div>
                        </div>
                        <div>
                            <DetailPayment cart={cart} />
                        </div>
                    </div>
                </div>
            </MainLayout>
        </>
    )
}