import React, { createContext, useState, useEffect, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { ServersList } from "../../../electron/types";
import { ISocket, ISocketChat } from "./WebsocketContext";

interface SocketContextType {
    messages: ISocket<ISocketChat>[];
    sendMessage: (message: string) => void;
    servers: ServersList[];
}

const ChatContext = createContext<SocketContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [servers, setServers] = useState<ServersList[]>([]);
    const [sockets, setSockets] = useState<{ [key: string]: Socket }>({});
    const [messages, setMessages] = useState<ISocket<ISocketChat>[]>([]);

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
                    console.log("Received message from server:", msg);
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

    useEffect(() => {
        window.api.onMessage((message: string) => {
            console.log("M<ESSAGE", message);
            try {
                const data_message = JSON.parse(message);
                console.log("data_message", data_message)
                setMessages((prev) => [...prev, data_message as unknown as ISocket<ISocketChat>]);
            } catch (err) {
                console.error("Error handling message:", err);
            }

        });

        return () => {
            // Remove listener when unmounting
            window.api.removeAllMessageListeners();
        };
    }, [])

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
