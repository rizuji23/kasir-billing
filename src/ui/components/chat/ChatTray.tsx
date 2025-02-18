import { Popover, PopoverTrigger, PopoverContent, Input, Button } from "@heroui/react";
import { Chip } from "@heroui/chip";
import { MessageCircle, SendHorizonal } from "lucide-react";

export default function ChatTray() {
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
                            <Chip size="sm" color="danger" className="self-center">5</Chip>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] items-start !p-1">
                    <div className="px-2 py-3 w-full max-h-[300px] min-h-[200px] overflow-y-auto">
                        <div className="flex flex-col gap-3">
                            <div className="w-full">
                                <div className="grid gap-3 w-full">
                                    {
                                        Array.from({ length: 10 }).map((_, i) => {
                                            return <>
                                                <div key={i} className="max-w-[200px] h-fit rounded-md bg-primary-500 p-2 text-white">
                                                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                                                    <div className="mt-3">
                                                        <small className="font-extralight">23 Mei 2022 01:00 AM</small>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end w-full">
                                                    <div className="max-w-[200px] h-fit rounded-md border-2 p-2 ">
                                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                                                        <div className="mt-3 text-end">
                                                            <small className="font-extralight">23 Mei 2022 01:00 AM</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex gap-2 py-3 px-2">
                        <Input variant="bordered" placeholder="Ketik pesan disini..." />
                        <Button isIconOnly color="primary">
                            <SendHorizonal className="w-5 h-5" />
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

        </>
    )
}