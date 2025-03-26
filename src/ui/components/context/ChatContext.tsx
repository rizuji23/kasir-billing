import React, { createContext, useState, useEffect, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { ServersList } from "../../../electron/types";
import { ISocket, ISocketChat } from "./WebsocketContext";
import { addToast } from "@heroui/react";
import { MessageCircleWarning } from "lucide-react";
import toast from "react-hot-toast";
import { Howl } from "howler";
import notif_sound from "../../assets/notification.wav";

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
            try {
                const data_message: ISocket<ISocketChat> = JSON.parse(message);

                setMessages((prev) => [...prev, data_message as unknown as ISocket<ISocketChat>]);
                socket.emit("message", message);
            } catch (err) {
                toast.error(`Error sending message to server: ${err}`);
            }
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
                const data_message: ISocket<ISocketChat> = JSON.parse(message);
                console.log("data_message", data_message)
                const sound = new Howl({
                    src: [notif_sound],
                    volume: 1
                });

                sound.play()
                addToast({
                    title: data_message.name,
                    description: data_message.data.message,
                    icon: <MessageCircleWarning />,
                    timeout: 8000
                })
                setMessages((prev) => [...prev, data_message as unknown as ISocket<ISocketChat>]);
            } catch (err) {
                toast.error(`Error receive message to server: ${err}`);
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
