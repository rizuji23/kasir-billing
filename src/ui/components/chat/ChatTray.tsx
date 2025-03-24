import { Popover, PopoverTrigger, PopoverContent, Input, Button } from "@heroui/react";
import { Chip } from "@heroui/chip";
import { MessageCircle, SendHorizonal } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import moment from "moment-timezone";
import { useChat } from "../context/ChatContext";

export default function ChatTray() {
    const chat = useChat();
    const [message, setMessage] = useState<string>("");

    const sendChat = async () => {
        try {
            if (message.length === 0) {
                toast.error("Pesan harus diisi");
                return;
            }

            const data_message = await window.api.send_chat(message);
            console.log("data_message", data_message.data)
            chat.sendMessage(JSON.stringify(data_message.data));
            setMessage("");
        } catch (err) {
            console.log(`Error sending chat: ${err}`);
        }
    }

    useEffect(() => {
        console.log(chat.messages)
    }, [chat.messages]);

    return (
        <>
            <Popover placement="top">
                <PopoverTrigger>
                    <div className="p-3 w-[300px] bg-muted fixed right-5 bottom-0 rounded-t-md cursor-pointer">
                        <div className="flex justify-between">
                            <div className="flex gap-3">
                                <MessageCircle className={"w-5 h-5 self-center fill-white"} />
                                <p className="font-bold">Pesan</p>
                            </div>
                            <Chip size="sm" color="danger" className="self-center">{chat.messages.length}</Chip>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] items-start !p-1">
                    <div className="px-2 py-3 w-full max-h-[300px] min-h-[200px] overflow-y-auto">
                        <div className="flex flex-col gap-3">
                            <div className="w-full">
                                <div className="grid gap-3 w-full">
                                    {
                                        chat.messages.map((el, i) => {
                                            return <div key={i}>
                                                <div className="w-full h-fit rounded-md bg-primary-500 p-2 text-white">
                                                    <small className="font-bold text-sm">{el.name}</small>
                                                    <p>{el.data.message}</p>
                                                    <div className="mt-3">
                                                        <small className="font-extralight">{moment(el.data.created_at).format("DD/MM/YYYY HH:mm:ss")}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex gap-2 py-3 px-2">
                        <Input variant="bordered" placeholder="Ketik pesan disini..." onKeyUp={(e) => {
                            if (e.key === "Enter") {
                                sendChat();
                            }
                        }} onChange={(e) => setMessage(e.target.value)} value={message} />
                        <Button isIconOnly color="primary" onPress={sendChat}>
                            <SendHorizonal className="w-5 h-5" />
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

        </>
    )
}