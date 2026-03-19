import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AboutPage() {
    const [currentVersion, setCurrentVersion] = useState<string>("");
    const [repo, setRepo] = useState<string>("");
    const [statusText, setStatusText] = useState<string>("Belum cek update");
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [isReadyInstall, setIsReadyInstall] = useState<boolean>(false);
    const [downloadPercent, setDownloadPercent] = useState<number>(0);
    const [isSavingRepo, setIsSavingRepo] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            try {
                const curr = await window.update.get_version();
                setCurrentVersion(curr);

                const repoSetting = await window.api.get_setting("UPDATE_GITHUB_REPO");
                if (repoSetting.status && repoSetting.data?.content) {
                    setRepo(repoSetting.data.content);
                }
            } catch (err) {
                toast.error(`Gagal load info update: ${err}`);
            }
        };

        init();

        const offAvailable = window.update.onUpdateAvailable((info) => {
            setStatusText(`Update tersedia: v${info.version}`);
            setIsChecking(false);
            setIsReadyInstall(false);
        });

        const offNotAvailable = window.update.onUpdateNotAvailable(() => {
            setStatusText("Aplikasi sudah versi terbaru");
            setIsChecking(false);
        });

        const offProgress = window.update.onDownloadProgress((progress) => {
            setDownloadPercent(progress.percent || 0);
            setStatusText(`Downloading update... ${Math.round(progress.percent || 0)}%`);
        });

        const offDownloaded = window.update.onUpdateDownloaded(() => {
            setIsDownloading(false);
            setIsReadyInstall(true);
            setStatusText("Update selesai didownload. Siap install.");
        });

        const offError = window.update.onUpdateError((error) => {
            const message = error?.message || String(error);
            setIsChecking(false);
            setIsDownloading(false);
            setStatusText(`Update error: ${message}`);

            if (!message.includes("No published versions on GitHub")) {
                toast.error(`Update gagal: ${message}`);
            }
        });

        return () => {
            offAvailable();
            offNotAvailable();
            offProgress();
            offDownloaded();
            offError();
        };
    }, []);

    const handleSaveRepo = async () => {
        setIsSavingRepo(true);
        try {
            const res = await window.api.save_url(
                "UPDATE_GITHUB_REPO",
                "GitHub Update Repository",
                repo.trim(),
            );
            if (res.status) {
                toast.success("Repository update berhasil disimpan");
            } else {
                toast.error(res.detail_message || "Gagal menyimpan repository update");
            }
        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        } finally {
            setIsSavingRepo(false);
        }
    };

    const handleCheckUpdate = async () => {
        if (!repo.trim()) {
            toast.error("Isi dulu repository GitHub update (format owner/repo)");
            return;
        }

        setIsChecking(true);
        setStatusText("Mengecek update dari GitHub Release...");
        window.update.checkForUpdates();
    };

    const handleDownloadUpdate = () => {
        setIsDownloading(true);
        setStatusText("Memulai download update...");
        window.update.downloadUpdate();
    };

    const handleInstallUpdate = () => {
        window.update.quitAndInstall();
    };

    return (
        <>
            <div className="grid gap-5">
                <Card>
                    <CardHeader><h3 className="font-bold text-lg">Versi Aplikasi:</h3></CardHeader>
                    <Divider />
                    <CardBody>
                        <div className="grid gap-3">
                            <div className="flex flex-col gap-3">
                                <div className="grid gap-3">
                                    <Chip color="success" classNames={{ content: "font-bold" }}>v{currentVersion}</Chip>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-bold text-lg">Auto Update (GitHub Release)</h3></CardHeader>
                    <Divider />
                    <CardBody>
                        <div className="grid gap-3">
                            <Input
                                isRequired
                                label="GitHub Repository"
                                placeholder="owner/repo atau https://github.com/owner/repo"
                                value={repo}
                                onChange={(e) => setRepo(e.target.value)}
                            />
                            <p className="text-sm text-default-600">{statusText}</p>
                            {isDownloading ? (
                                <p className="text-xs text-default-500">Progress: {Math.round(downloadPercent)}%</p>
                            ) : null}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onPress={handleSaveRepo}
                                    isLoading={isSavingRepo}
                                    isDisabled={isChecking || isDownloading}
                                >
                                    Simpan Repository
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleCheckUpdate}
                                    isLoading={isChecking}
                                    isDisabled={isSavingRepo || isDownloading}
                                >
                                    Check Update
                                </Button>
                                <Button
                                    color="success"
                                    variant="flat"
                                    onPress={handleDownloadUpdate}
                                    isLoading={isDownloading}
                                    isDisabled={isChecking || isSavingRepo || isReadyInstall}
                                >
                                    Download Update
                                </Button>
                                <Button
                                    color="warning"
                                    onPress={handleInstallUpdate}
                                    isDisabled={!isReadyInstall}
                                >
                                    Install Update
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
