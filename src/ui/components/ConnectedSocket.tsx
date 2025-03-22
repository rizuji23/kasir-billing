import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { GitGraph } from "lucide-react";
import { useWebsocketData } from "./context/WebsocketContext";

export default function ConnectedSocket() {
    const socket = useWebsocketData();

    return (
        <>
            <Popover placement="top">
                <PopoverTrigger>
                    <div className="p-3 w-[300px] bg-muted fixed right-[340px] bottom-0 rounded-t-md cursor-pointer">
                        <div className="flex justify-between">
                            <div className="flex gap-3">
                                <GitGraph className={"w-5 h-5 self-center fill-white"} />
                                <p className="font-bold">Jaringan</p>
                            </div>
                            <Chip color="success" size="sm">{socket.connectedCashiers.length + socket.connectedKitchens.length}</Chip>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] items-start !p-2">
                    <div className="grid gap-2 w-full">
                        {
                            socket.connectedCashiers.length === 0 && socket.connectedKitchens.length === 0 && (
                                <div className="flex justify-center">
                                    <Chip size="sm" color="danger">Tidak ada koneksi</Chip>
                                </div>
                            )
                        }
                        {
                            socket.connectedKitchens.map((el, i) => {
                                return <Card className="w-full" key={i}>
                                    <CardBody>
                                        <div className="flex justify-between">
                                            <p className="self-center font-bold">{el}</p>
                                            <Chip size="sm" color="success">Terhubung</Chip>
                                        </div>
                                    </CardBody>
                                </Card>
                            })
                        }

                        {
                            socket.connectedCashiers.map((el, i) => {
                                return <Card className="w-full" key={i}>
                                    <CardBody>
                                        <div className="flex justify-between">
                                            <p className="self-center font-bold">{el}</p>
                                            <Chip size="sm" color="success">Terhubung</Chip>
                                        </div>
                                    </CardBody>
                                </Card>
                            })
                        }


                    </div>
                </PopoverContent>
            </Popover>
        </>
    )
}