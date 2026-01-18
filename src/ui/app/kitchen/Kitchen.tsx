import MainLayout from "../../components/MainLayout";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Input,
    Chip,
} from "@heroui/react";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { IKitchenIncoming } from "../../../electron/types";
import moment from "moment-timezone";
import debounce from "lodash/debounce";

export default function KitchenPage() {
    const [kitchenData, setKitchenData] = useState<IKitchenIncoming[]>([]);
    const [filteredData, setFilteredData] = useState<IKitchenIncoming[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const cleanup = window.socket.onKitchenUpdate((data) => {
            setKitchenData(data);
            setFilteredData(data);
        });

        window.socket.rendererReady();

        return cleanup;
    }, []);

    const debouncedSearch = useMemo(
        () =>
            debounce((value: string, source: IKitchenIncoming[]) => {
                const keyword = value.trim().toLowerCase();

                if (!keyword) {
                    setFilteredData(source);
                    return;
                }

                const result = source.filter((el) => {
                    const name = el.order?.[0]?.name?.toLowerCase() || "";
                    const orderId = el.order?.[0]?.id_order_cafe?.toLowerCase() || "";

                    return (
                        name.includes(keyword) ||
                        orderId.includes(keyword)
                    );
                });

                setFilteredData(result);
            }, 300),
        [],
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return (
        <MainLayout>
            <div className="flex flex-col gap-5">
                <div className="flex justify-between">
                    <h1 className="text-2xl font-bold">Dapur Sedang Berlangsung Hari Ini</h1>
                </div>

                <div className="flex justify-end gap-3">
                    <div className="max-w-[300px] flex-1">
                        <Input
                            placeholder="Cari Nama / ID Order Pelanggan"
                            value={search}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearch(value);
                                debouncedSearch(value, kitchenData);
                            }}
                            startContent={
                                <Search className="w-5 h-5 text-default-400 pointer-events-none shrink-0" />
                            }
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableColumn>Tanggal</TableColumn>
                        <TableColumn>Pelanggan</TableColumn>
                        <TableColumn>Tipe Order</TableColumn>
                        <TableColumn className="text-center">Nomor Meja</TableColumn>
                        <TableColumn>Keterangan</TableColumn>
                        <TableColumn>Status</TableColumn>
                    </TableHeader>

                    <TableBody emptyContent={"Data tidak ditemukan"}>
                        {filteredData.map((el, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    {moment(el.created_at).format("HH:mm A")}
                                </TableCell>

                                <TableCell>{el.order[0].name}</TableCell>

                                <TableCell>
                                    {el.order_type === "CAFE" ? (
                                        <Chip color="success">CAFE</Chip>
                                    ) : (
                                        <Chip color="warning">TABLE</Chip>
                                    )}
                                </TableCell>

                                <TableCell className="text-center">
                                    {el.no_meja || "-"}
                                </TableCell>

                                <TableCell>
                                    {el.order[0].keterangan || "-"}
                                </TableCell>

                                <TableCell>
                                    {el.status_kitchen === "NO_PROCESSED" ? (
                                        <Chip className="bg-slate-600 text-white">
                                            Belum Disiapkan
                                        </Chip>
                                    ) : el.status_kitchen === "PROCESSED" ? (
                                        <Chip className="bg-blue-600 text-white">
                                            Sedang Disiapkan
                                        </Chip>
                                    ) : el.status_kitchen === "DONE" ? (
                                        <Chip className="bg-green-600 text-white">
                                            Selesai
                                        </Chip>
                                    ) : (
                                        <Chip className="bg-red-600 text-white">
                                            Ditolak
                                        </Chip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </MainLayout>
    );
}
