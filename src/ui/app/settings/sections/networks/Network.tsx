import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useEffect, useState } from "react";
import NotFound from "../../../../components/NotFound";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import ModalAddNetwork from "./ModalAddNetwork";
import { ServersList } from "../../../../../electron/types";
import { toast } from "sonner";
import { LoadingComponent } from "../../../../components/datatable/DataTableCustom";

function CardNetwork({ title, type_server, my_ip, data, api }: { title: string; type_server: "cashier" | "kitchen", my_ip: string | null, data: ServersList[], api: () => Promise<void> }) {
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleOption = async (ip: string, opsi: "delete" | "check") => {
        setLoading(true);
        try {
            const res = await window.api.opsi_network(ip, opsi);

            setLoading(false);

            if (res.status) {
                api();
            }
        } catch (err) {
            setLoading(false);
            toast.error(`Gagal mengubah Network: ${err}`);
        }
    }

    return <>
        <Card className="h-fit">
            <CardHeader className="font-bold">{title}</CardHeader>
            <CardBody>
                <div className="grid gap-3">
                    <Table removeWrapper>
                        <TableHeader>
                            <TableColumn>IP</TableColumn>
                            <TableColumn>Nomor {type_server === "cashier" ? "Kasir" : "Dapur"}</TableColumn>
                            <TableColumn>Status</TableColumn>
                            <TableColumn>Opsi</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {
                                data.map((el, i) => {
                                    return <TableRow key={i}>
                                        <TableCell>{el.ip}</TableCell>
                                        <TableCell>{el.number}</TableCell>
                                        <TableCell>
                                            <Chip color={el.status === "CONNECTED" ? "success" : "danger"} size="sm">
                                                {el.status === "CONNECTED" ? "Terkoneksi" : "Tidak Terkoneksi"}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-3">
                                                <Button size="sm" isLoading={loading} onPress={() => handleOption(el.ip, "check")}>Cek Koneksi</Button>
                                                <Button size="sm" color="danger" isLoading={loading} onPress={() => {
                                                    if (confirm("Apakah anda yakin?")) {
                                                        handleOption(el.ip, "delete")
                                                    }
                                                }}>Hapus</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                })
                            }

                        </TableBody>
                    </Table>
                    <Button onPress={() => setOpen(true)}>Tambah {type_server === "cashier" ? "Kasir" : "Dapur"}</Button>
                </div>
            </CardBody>
        </Card>
        <ModalAddNetwork open={open} setOpen={setOpen} my_ip={my_ip} api={api} type_network={type_server} />
    </>
}

export default function NetworkSection() {
    const [my_ip, setMyIp] = useState<string | null>(null);
    const [list_network, setListNetwork] = useState<{
        cashier: ServersList[],
        kitchen: ServersList[]
    }>({
        cashier: [],
        kitchen: [],
    })

    const [loading, setLoading] = useState<boolean>(false);

    const getListNetwork = async () => {
        setLoading(true)
        try {
            const res = await window.api.list_network();

            setLoading(false);

            if (res.status && res.data) {
                setListNetwork(res.data);
            } else {
                toast.error("Gagal mengambil data network");
            }

        } catch (err) {
            setLoading(false)
            toast.error(`Gagal mengambil data network: ${err}`);
        }
    }

    const getCurrentIp = async () => {
        const res = await window.api.my_ip();
        setMyIp(res);
    }

    useEffect(() => {
        getCurrentIp();
        getListNetwork();
    }, []);


    // for port is default 3321

    return (
        <>
            {
                !my_ip ? <NotFound title="Anda tidak terkoneksi oleh jaringan" /> :
                    <div className="grid gap-5 mb-10">
                        <div className="flex justify-end">
                            <Card className="max-w-fit">
                                <CardBody className="text-end">
                                    <p className="font-bold">IP Aplikasi: <span className="text-success-500">{my_ip}</span></p>
                                </CardBody>
                            </Card>
                        </div>
                        {
                            loading ? <LoadingComponent /> : <>
                                <CardNetwork type_server="cashier" data={list_network.cashier} api={getListNetwork} title="Jaringan Kasir" my_ip={my_ip} />
                                <CardNetwork type_server="kitchen" data={list_network.kitchen} api={getListNetwork} title="Jaringan Dapur" my_ip={my_ip} />
                            </>
                        }
                    </div>
            }

        </>
    )
}