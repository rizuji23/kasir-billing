import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";

export default function ServerApi() {
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
                            placeholder="Masukan URL disini"
                            type="text"
                        />
                        <Input
                            isRequired
                            label="Websocket Local"
                            name="websocket_local"
                            errorMessage={"Silakan isi kolom ini."}
                            placeholder="Masukan URL disini"
                            type="text"
                            endContent={<Button size="sm" color="success">Test Koneksi</Button>}
                        />
                        <Input
                            isRequired
                            label="Websocket Server"
                            name="websocket_server"
                            errorMessage={"Silakan isi kolom ini."}
                            placeholder="Masukan URL disini"
                            type="text"
                            endContent={<Button size="sm" color="success">Test Koneksi</Button>}
                        />
                    </div>
                </CardBody>
                <CardFooter className="justify-end">
                    <Button>Simpan Perubahan</Button>
                </CardFooter>
            </Card>
        </>
    )
}