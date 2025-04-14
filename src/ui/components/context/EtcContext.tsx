import { useState, useEffect, useRef } from "react";
import head_wolf from "../../assets/head.png";
import { cn } from "../../lib/utils";

export function EtcComponent({ children }: { children: React.ReactNode }) {
    const [blocked, setBlocked] = useState<boolean>(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000; // 1 second

    const connectWebSocket = () => {
        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
        }

        const ws = new WebSocket("ws://remote.rlstudio.my.id");
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected");
            reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        };

        ws.onmessage = (event) => {
            console.log(event.data);
            try {
                const message = JSON.parse(event.data);
                if (message.type === "BLOCK_UI") {
                    setBlocked(message.blocked);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = (event) => {
            console.log("WebSocket disconnected", event.code, event.reason);
            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                const delay = Math.min(
                    baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current),
                    30000 // Max 30 seconds delay
                );
                console.log(`Reconnecting in ${delay}ms...`);

                setTimeout(() => {
                    reconnectAttemptsRef.current++;
                    connectWebSocket();
                }, delay);
            } else {
                console.log("Max reconnection attempts reached");
            }
        };
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            // Cleanup on unmount
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []);

    return (
        <>
            <div className={cn(
                "w-screen h-screen absolute top-0 left-0 right-0 bottom-0",
                blocked ? "overflow-hidden" : "overflow-x-hidden"
            )}>
                {children}
                {blocked && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 z-50">
                        <div className="flex justify-center pt-10">
                            <img src={head_wolf} className="w-[450px]" alt="" />
                            <div className="flex items-center justify-center">
                                <div className="text-white text-6xl font-bold">ACCESS DENIED</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}