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
import { IIPList, ServersList } from "../../../../../electron/types";
import toast from 'react-hot-toast';
import { LoadingComponent } from "../../../../components/datatable/DataTableCustom";
import SelectCustom from "../../../../components/SelectCustom";
import { Alert } from "@heroui/alert";

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
                window.location.reload();
            }
        } catch (err) {
            setLoading(false);
            toast.error(`Gagal mengubah Network: ${err}`);
        }
    }

    return <>
        <Card className="h-fit">
            <CardHeader className="flex justify-between">
                <span className="font-bold">{title}</span>
                <Button onPress={() => setOpen(true)}>Tambah {type_server === "cashier" ? "Kasir" : "Dapur"}</Button>
            </CardHeader>

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
                                                <Button size="sm" color="danger" isLoading={loading} onPress={async () => {
                                                    const confirm = window.api.confirm();
                                                    if (await confirm) {
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

                </div>
            </CardBody>
        </Card>
        <ModalAddNetwork open={open} setOpen={setOpen} my_ip={my_ip} api={api} type_network={type_server} />
    </>
}

export default function NetworkSection() {
    const [my_ip, setMyIp] = useState<string | null>(null);
    const [ip_list, setIpList] = useState<IIPList[]>([]);
    const [list_network, setListNetwork] = useState<{
        cashier: ServersList[],
        kitchen: ServersList[]
    }>({
        cashier: [],
        kitchen: [],
    });
    const [selected, setSelected] = useState<string>("");
    const [selected_kitchen, setSelectedKitchen] = useState<string>("Tidak Ada Jaringan");

    const [loading, setLoading] = useState<boolean>(false);

    const getIpLocal = async () => {
        setLoading(true)
        const res = await window.api.network_scan(4321);

        setIpList(res.filter((el) => el.ip !== my_ip));
        setLoading(false);
        console.log(res);
    }

    const getListNetwork = async () => {
        setLoading(true)
        try {
            const res = await window.api.list_network();
            console.log("res", res)
            setLoading(false);

            if (res.status && res.data) {
                setSelectedKitchen(res.data.kitchen.length === 0 ? "Tidak Ada Jaringan" : res.data.kitchen[0].ip);
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
        (async () => {
            await getCurrentIp();
            await getListNetwork();
            await getIpLocal();
        })();
    }, []);


    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (selected.length === 0) {
                toast.error("Socket IP wajib diisi");
                return;
            }

            const res = await window.api.save_socket(selected);

            if (res.status) {
                toast.success("Jaringan berhasil disimpan");
                window.location.reload();
            }

        } catch (err) {
            toast.error(`Gagal menambahkan Network: ${err}`);
        } finally {
            setLoading(false);
        }
    }

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
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <CardNetwork type_server="cashier" data={list_network.cashier} api={getListNetwork} title="Jaringan Kasir" my_ip={my_ip} />
                                    </div>
                                    <div>
                                        <Card>
                                            <CardHeader className="font-bold">Jaringan Dapur</CardHeader>
                                            <CardBody className="grid gap-5">
                                                <div>
                                                    <Alert hideIcon color="success" description={selected_kitchen} title={"Jaringan Dapur Saat Ini: "} variant="faded" />
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <SelectCustom disabled={loading} label="IP Address" onChange={(e) => setSelected(e.target.value)} value={selected}>
                                                        <SelectCustom.Option value="">Pilih IP...</SelectCustom.Option>
                                                        {
                                                            ip_list.map((item) => (
                                                                <SelectCustom.Option value={item.ip}>{item.ip}</SelectCustom.Option>
                                                            ))
                                                        }

                                                    </SelectCustom>
                                                    <Button isLoading={loading} onPress={handleSubmit}>Simpan</Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
            }

        </>
    )
}