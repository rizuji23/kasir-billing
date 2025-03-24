import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ServersList, TableBilliard } from "../../../electron/types";

export type WebsocketResponseType = "table_status" | "chat" | "kitchen"

export interface ISocket<T> {
    type: WebsocketResponseType,
    ip: string,
    data: T,
    name: string
}

export interface ISocketChat {
    message: string,
    created_at: Date
}

interface WebSocketContextProps {
    tableRemote: ISocket<TableBilliard[]>[];
    connectedCashiers: string[];
    list_servers: {
        cashier: ServersList[];
        kitchen: ServersList[];
    },
    broadcastMessage: (message: string) => void;
    chat: ISocket<ISocketChat>[];
    connectedKitchens: string[];
}

const WebsocketContext = createContext<WebSocketContextProps | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const connections = useRef(new Map<string, WebSocket>());
    const [list_servers, setListServers] = useState<{
        cashier: ServersList[];
        kitchen: ServersList[];
    }>({
        cashier: [],
        kitchen: [],
    });
    const [connectedCashiers, setConnectedCashiers] = useState<string[]>([]);
    const [connectedKitchens, setConnectedKitchens] = useState<string[]>([]);

    const [tableRemote, setTableRemote] = useState<ISocket<TableBilliard[]>[]>([]);
    const [chat, setChat] = useState<ISocket<ISocketChat>[]>([]);

    const getIpLocal = async () => {
        const res = await window.api.list_network();

        if (res.status && res.data) {
            console.log("res.data", res.data)
            setListServers(res.data);
            return res.data
        }

        return undefined
    }

    const connectToServer = (ip: string, port: number) => {
        if (connections.current.has(ip)) return;

        const url = `ws://${ip}:${port}`;
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log(`Connected to ${url}`);
            connections.current.set(ip, ws);

            if (port === 3321) setConnectedCashiers((prev) => [...prev, ip]);
            if (port === 4321) setConnectedKitchens((prev) => [...prev, ip]);

            window.api.onSendKitchen((data) => {
                // console.log("connectedKitchens.length", connectedKitchens.length)
                // if (connectedKitchens.length === 0) {
                //     window.api.show_message_box("warning", "Dapur tidak terkoneksi, maka struk dapur tidak akan terkirim.");
                //     return;
                // }

                ws.send(data)
            })
        }

        ws.onmessage = (event) => {

            const data_incoming: ISocket<unknown> = JSON.parse(event.data);

            if (data_incoming.type === "table_status") {
                setTableRemote((prev) => {
                    const existingIndex = prev.findIndex((el) => el.ip === data_incoming.ip);

                    if (existingIndex === -1) {
                        return [...prev, data_incoming as unknown as ISocket<TableBilliard[]>];
                    } else {
                        const updatedTables = [...prev];
                        updatedTables[existingIndex] = data_incoming as unknown as ISocket<TableBilliard[]>;
                        return updatedTables;
                    }
                });
            }

            // console.log("MESSAGE", event.data)
        };

        ws.onclose = () => {
            console.log(`Disconnected from ${url}`);
            connections.current.delete(ip);

            if (port === 3321) setConnectedCashiers((prev) => prev.filter((c) => c !== ip));
            if (port === 4321) setConnectedKitchens((prev) => prev.filter((c) => c !== ip));

            // Remove the table data for the disconnected IP
            const data_table_before = tableRemote.filter((el) => el.ip !== ip)
            setTableRemote(data_table_before);

            // Attempt to reconnect after 5 seconds
            setTimeout(() => connectToServer(ip, port), 5000);
        }

        ws.onerror = () => {
            console.log(`Error connecting to ${url}:`);
        }
    }

    const connectInitial = async () => {
        const get_list = await getIpLocal();

        (get_list?.cashier || []).forEach((ip) => {
            connectToServer(ip.ip, 3321);
        });

        (get_list?.kitchen || []).forEach((ip) => {
            connectToServer(ip.ip, 4321);
        });
    }

    const broadcastMessage = (message: string) => {
        console.log("connections", connections.current)
        connections.current.forEach((ws, ip) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            } else {
                console.warn(`Cannot send message. No connection to ${ip}`);
            }
        });
    };

    useEffect(() => {
        connectInitial();

        return () => {
            connections.current.forEach((ws) => ws.close());
            connections.current.clear();
        }
    }, []);

    // useEffect(() => {
    //     console.log("Table", tableRemote)
    // }, [tableRemote])
    return (
        <WebsocketContext.Provider value={{ tableRemote, connectedCashiers, list_servers, broadcastMessage, chat, connectedKitchens }}>
            <div>
                {children}
            </div>
        </WebsocketContext.Provider>
    )
}

export const useWebsocketData = () => {
    const context = useContext(WebsocketContext);
    if (!context) {
        throw new Error("useWebsocketData must be used within a WebSocketProvider");
    }
    return context;
}