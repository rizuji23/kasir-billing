import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { atom, useAtom } from "jotai";
import { UserData } from "../../../electron/types";
import toast from "react-hot-toast";
import { LoadingComponent } from "../datatable/DataTableCustom";

const configUserDetail = atom<UserData | null>(null);

export function useGetUserInfo() {
    return useAtom(configUserDetail);
}

export default function MiddlewareContext({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [access, setAccess] = useState<boolean>(false);
    const location = useLocation();
    const setUser = useGetUserInfo();

    const getDetailUser = async () => {
        setLoading(true);
        try {
            const res = await window.api.middleware();
            if (res.data?.username === undefined) {
                console.log("dd")
                setAccess(false);
                return;
            }

            console.log("user", res.data?.username)


            setAccess(true);
            setUser[1](res.data);
        } catch (err) {
            console.error("ERROR", err);
            toast.error(`Error Auth Middleware: ${err}`);
            setAccess(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getDetailUser();
    }, [location]);

    useEffect(() => {
        console.log(access)
    }, [access]);

    if (loading) {
        return <LoadingComponent />
    }

    if (!access) {
        return <Navigate to={'/'} replace />
    }

    return children
}