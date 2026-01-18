import { createContext, useContext, useEffect, useState } from "react";
import { IRejectIncoming } from "../../../electron/types";
import DialogOrderReject from "../dialog/DialogOrderReject";

type SocketContextType = {
    connected: boolean;
};

const SocketContext = createContext<SocketContextType>({
    connected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [connected, setConnected] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const [reject, setReject] = useState<IRejectIncoming | null>(null);

    useEffect(() => {
        window.socket.getStatus().then((status) => {
            console.log("initial status:", status);
            setConnected(status);
        });

        const off = window.socket.onStatus((status) => {
            console.log("status update:", status);
            setConnected(status);
        });

        return off;
    }, []);

    useEffect(() => {
        const cleanup = window.socket.onKitchenReject((data) => {
            setOpen(true);
            setReject(data);
        });

        return cleanup;
    }, []);

    return (
        <SocketContext.Provider value={{ connected }}>
            {children}
            <DialogOrderReject open={open} setOpen={setOpen} data={reject} />
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
