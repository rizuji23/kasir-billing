import { useState } from "react"

export default function Middleware({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [access, setAccess] = useState<boolean>(true);



    return <>
        {children}
    </>
}