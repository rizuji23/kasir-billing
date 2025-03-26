import { CirclePower, Cog, FileChartColumn, Home, Utensils } from "lucide-react";
import logo from "../../assets/logo-login.png";
import { Link, useLocation } from "react-router";
import { cn } from "../../lib/utils";
import HoursShift from "../../app/dashboard/HoursShift";

const sidebar: { title: string, icon: React.ReactNode, href: string }[] = [
    {
        title: "Dashboard",
        icon: <Home className="w-5 h-5" />,
        href: "/dashboard"
    },
    // {
    //     title: "Order",
    //     icon: <ShoppingCart className="w-5 h-5" />,
    //     href: "/order"
    // },

    {
        title: "Menu",
        icon: <Utensils className="w-5 h-5" />,
        href: "/menu"
    },
    // {
    //     title: "Dapur",
    //     icon: <ChefHat className="w-5 h-5" />,
    //     href: "/kitchen"
    // },
    // {
    //     title: "Member",
    //     icon: <UserRoundPen className="w-5 h-5" />,
    //     href: "/member"
    // },
    {
        title: "Laporan",
        icon: <FileChartColumn className="w-5 h-5" />,
        href: "/report"
    },
    // {
    //     title: "Stok",
    //     icon: <Box className="w-5 h-5" />,
    //     href: "/stock"
    // },
    {
        title: "Manual Lampu",
        icon: <CirclePower className="w-5 h-5" />,
        href: "/manual"
    },
    {
        title: "Pengaturan",
        icon: <Cog className="w-5 h-5" />,
        href: "/settings"
    }
]

export default function SidebarComponent() {
    const pathname = useLocation()

    return (
        <>
            <div className="w-[200px] h-screen bg-[#18181B] fixed">
                <div className="flex flex-col gap-4 px-3 pt-5 pb-4">
                    <div className="px-2">
                        <img src={logo} className="w-32" alt="" />
                    </div>
                    <div className="grid gap-3 mt-5">
                        {
                            sidebar.map((el, i) => {
                                return <Link to={el.href} key={i}>
                                    <div className={cn("p-3 rounded-md hover:bg-muted duration-300 transition-colors", el.href === pathname.pathname && "bg-muted")}>
                                        <div className="flex gap-3">
                                            <div className="self-center">
                                                {el.icon}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{el.title}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            })
                        }
                    </div>
                </div>
                <div className="p-3 mt-5">

                    {
                        pathname.pathname !== "/dashboard" && <div className="w-full p-3 bg-muted rounded-md">
                            <div className="flex flex-col justify-center gap-3">
                                <HoursShift />
                            </div>
                        </div>
                    }
                    {/* <div className="w-full p-3 bg-muted rounded-md">
                        <div className="flex flex-col gap-3">
                            <div>
                                <User
                                    description="Kasir"
                                    name="Kasir Cozypool"
                                />
                            </div>
                            <Button>Sign Out</Button>
                        </div>
                    </div> */}
                </div>
            </div>
        </>
    )
}