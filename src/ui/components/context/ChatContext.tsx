import React, { createContext, useState, useEffect, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { ServersList } from "../../../electron/types";

interface SocketContextType {
    messages: { [key: string]: string[] };
    sendMessage: (message: string) => void;
    servers: ServersList[];
}

const ChatContext = createContext<SocketContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [servers, setServers] = useState<ServersList[]>([]);
    const [sockets, setSockets] = useState<{ [key: string]: Socket }>({});
    const [messages, setMessages] = useState<{ [key: string]: string[] }>({});

    const getIpLocal = async () => {
        const res = await window.api.list_network();
        if (res.status && res.data) {
            console.log("Available servers:", res.data);
            setServers(res.data.cashier);
            return res.data.cashier;
        }
        return [];
    };

    const connectToServers = async () => {
        try {
            const localServers = await getIpLocal();
            const newSockets: { [key: string]: Socket } = {};

            localServers.forEach((server) => {
                const socket = io(`http://${server.ip}:5321`);

                socket.on("connect", () => console.log(`Connected to ${server.ip}:5321`));
                socket.on("disconnect", () => console.log(`Disconnected from ${server.ip}:5321`));

                socket.on("message", (msg) => {
                    console.log("msg", msg)
                    setMessages((prev) => ({
                        ...prev,
                        [server.id]: [...(prev[server.id] || []), msg],
                    }));
                });

                newSockets[server.id] = socket;
            });

            setSockets(newSockets);
        } catch (err) {
            console.error("Error connecting to servers:", err);
        }
    };

    // Send message to ALL servers
    const sendMessage = (message: string) => {
        Object.values(sockets).forEach((socket) => {
            socket.emit("message", message);
        });
    };

    useEffect(() => {
        connectToServers();

        return () => {
            Object.values(sockets).forEach((socket) => socket.disconnect());
        };
    }, []);

    return (
        <ChatContext.Provider value={{ messages, sendMessage, servers }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = (): SocketContextType => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};
