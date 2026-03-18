import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IBackupProgress } from "../../../../../electron/types";

export default function ServerApi() {
    const [serverBackup, setServerBackup] = useState("");
    const [tableStatusWss, setTableStatusWss] = useState("wss://cozy.saintekrekacipta.com");
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testingWss, setTestingWss] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<IBackupProgress | null>(null);
    const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(true);
    const [autoBackupLoading, setAutoBackupLoading] = useState<boolean>(false);

    const progressColor = progress?.status === "success"
        ? "success"
        : progress?.status === "error"
            ? "danger"
            : "warning";

    const getBackupEndpoint = async () => {
        setLoading(true);
        try {
            const [res, backupStatus] = await Promise.all([
                window.api.get_setting("BACKUP_SERVER_ENDPOINT"),
                window.api.backup_auto_status(),
            ]);
            const wssRes = await window.api.get_setting("TABLE_STATUS_WSS_URL");

            if (res.status && res.data) {
                setServerBackup(res.data.content || "");
            } else {
                setServerBackup("");
            }
            if (wssRes.status && wssRes.data?.content) {
                setTableStatusWss(wssRes.data.content);
            }

            if (backupStatus.status && backupStatus.data) {
                setAutoBackupEnabled(backupStatus.data.enabled);
            }
        } catch (err) {
            toast.error(`Gagal memuat endpoint backup: ${err}`);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await window.api.save_url(
                "BACKUP_SERVER_ENDPOINT",
                "Server Backup Endpoint",
                serverBackup.trim(),
            );
            const resWss = await window.api.save_url(
                "TABLE_STATUS_WSS_URL",
                "Table Status WebSocket URL",
                tableStatusWss.trim(),
            );

            if (res.status && resWss.status) {
                toast.success("Pengaturan server berhasil disimpan");
            } else {
                toast.error(
                    res.detail_message || resWss.detail_message || "Gagal menyimpan pengaturan server",
                );
            }
        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        try {
            const res = await window.api.test_backup_server(serverBackup.trim());
            if (res.status) {
                toast.success("Koneksi server backup berhasil");
            } else {
                toast.error(res.detail_message || "Koneksi server backup gagal");
            }
        } catch (err) {
            toast.error(`Terjadi kesalahan saat test koneksi: ${err}`);
        } finally {
            setTesting(false);
        }
    };

    const handleBackupNow = async () => {
        setBackingUp(true);
        try {
            const res = await window.api.backup_now();
            if (res.status) {
                toast.success("Backup data berhasil dijalankan");
            } else {
                toast.error(res.detail_message || "Backup data gagal");
            }
        } catch (err) {
            toast.error(`Terjadi kesalahan saat backup: ${err}`);
        } finally {
            setBackingUp(false);
        }
    };

    const handleTestTableStatusWss = async () => {
        setTestingWss(true);
        try {
            const res = await window.api.test_table_status_wss(tableStatusWss.trim());
            if (res.status) {
                toast.success("Koneksi websocket table status berhasil");
            } else {
                toast.error(res.detail_message || "Koneksi websocket table status gagal");
            }
        } catch (err) {
            toast.error(`Terjadi kesalahan saat test websocket: ${err}`);
        } finally {
            setTestingWss(false);
        }
    };

    const handleStopAutoBackup = async () => {
        setAutoBackupLoading(true);
        try {
            const res = await window.api.backup_auto_stop();
            if (res.status) {
                setAutoBackupEnabled(false);
                toast.success("Auto backup berhasil dihentikan");
            } else {
                toast.error(res.detail_message || "Gagal menghentikan auto backup");
            }
        } catch (err) {
            toast.error(`Terjadi kesalahan saat menghentikan auto backup: ${err}`);
        } finally {
            setAutoBackupLoading(false);
        }
    };

    const handleStartAutoBackup = async () => {
        setAutoBackupLoading(true);
        try {
            const res = await window.api.backup_auto_start();
            if (res.status) {
                setAutoBackupEnabled(true);
                toast.success("Auto backup berhasil dinyalakan");
            } else {
                toast.error(res.detail_message || "Gagal menyalakan auto backup");
            }
        } catch (err) {
            toast.error(`Terjadi kesalahan saat menyalakan auto backup: ${err}`);
        } finally {
            setAutoBackupLoading(false);
        }
    };

    useEffect(() => {
        getBackupEndpoint();

        const cleanup = window.api.onBackupProgress((data) => {
            setProgress(data);
        });

        return () => {
            cleanup();
        };
    }, []);

    return (
        <>
            <Card>
                <CardHeader className="font-bold">Server</CardHeader>
                <CardBody>
                    <div className="grid gap-3">
                        <Input
                            isRequired
                            label="Server Backup"
                            name="server_backup"
                            errorMessage={"Silakan isi kolom ini."}
                            placeholder="Masukkan URL endpoint backup"
                            type="text"
                            value={serverBackup}
                            onChange={(e) => setServerBackup(e.target.value)}
                            isDisabled={loading || saving}
                            description="Auto backup aktif setiap 2 menit, dan bisa dijalankan manual lewat tombol Backup Data."
                            endContent={
                                <Button
                                    size="sm"
                                    color="success"
                                    isLoading={testing}
                                    onPress={handleTestConnection}
                                    isDisabled={loading || saving || !serverBackup.trim()}
                                >
                                    Test Koneksi
                                </Button>
                            }
                        />
                        <Input
                            isRequired
                            label="WebSocket Table Status"
                            name="table_status_wss"
                            errorMessage={"Silakan isi kolom ini."}
                            placeholder="wss://cozy.saintekrekacipta.com"
                            type="text"
                            value={tableStatusWss}
                            onChange={(e) => setTableStatusWss(e.target.value)}
                            isDisabled={loading || saving}
                            description="Broadcast table_status dari billing akan dikirim ke websocket ini."
                            endContent={
                                <Button
                                    size="sm"
                                    color="success"
                                    isLoading={testingWss}
                                    onPress={handleTestTableStatusWss}
                                    isDisabled={loading || saving || !tableStatusWss.trim()}
                                >
                                    Test Koneksi
                                </Button>
                            }
                        />
                        <div className="rounded-md border p-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold">Progress Backup</p>
                                <Chip size="sm" color={progressColor}>
                                    {progress?.status || "idle"}
                                </Chip>
                            </div>
                            <p className="mt-2 text-sm text-default-600">
                                {progress?.message || "Belum ada proses backup berjalan."}
                            </p>
                            <p className="mt-1 text-xs text-default-500">
                                Step: {progress ? `${progress.step}/${progress.totalSteps}` : "-"}
                            </p>
                            <p className="mt-1 text-xs text-default-500">
                                Auto Backup: {autoBackupEnabled ? "Aktif (2 menit)" : "Nonaktif"}
                            </p>
                            {progress?.payloadSizeKb !== undefined ? (
                                <p className="mt-1 text-xs text-default-500">
                                    Payload: {progress.payloadSizeKb} KB
                                </p>
                            ) : null}
                            {progress?.durationMs !== undefined ? (
                                <p className="mt-1 text-xs text-default-500">
                                    Durasi: {progress.durationMs} ms
                                </p>
                            ) : null}
                            {progress?.error ? (
                                <p className="mt-1 text-xs text-danger">
                                    Error: {progress.error}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </CardBody>
                <CardFooter className="justify-end gap-2">
                    {autoBackupEnabled ? (
                        <Button
                            color="danger"
                            variant="flat"
                            onPress={handleStopAutoBackup}
                            isLoading={autoBackupLoading}
                            isDisabled={loading || saving || backingUp || autoBackupLoading}
                        >
                            Stop Auto Backup
                        </Button>
                    ) : (
                        <Button
                            color="success"
                            variant="flat"
                            onPress={handleStartAutoBackup}
                            isLoading={autoBackupLoading}
                            isDisabled={loading || saving || backingUp || autoBackupLoading}
                        >
                            Nyalakan Auto Backup
                        </Button>
                    )}
                    <Button
                        color="primary"
                        variant="flat"
                        onPress={handleBackupNow}
                        isLoading={backingUp}
                        isDisabled={loading || saving || backingUp || autoBackupLoading}
                    >
                        Backup Data
                    </Button>
                    <Button
                        onPress={handleSave}
                        isLoading={saving}
                        isDisabled={loading || backingUp || autoBackupLoading || testingWss}
                    >
                        Simpan Perubahan
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}
