import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Select, SelectItem } from "@heroui/select";

export default function HardwareApi() {
    return (
        <>
            <Card className="h-fit">
                <CardHeader className="font-bold">Hardware</CardHeader>
                <CardBody>
                    <div className="grid gap-3">
                        <Select label="COM Port" placeholder="Pilih COM Port disini">
                            <SelectItem key={"COM 1"}>COM 1</SelectItem>
                            <SelectItem key={"COM 2"}>COM 2</SelectItem>
                            <SelectItem key={"COM 3"}>COM 3</SelectItem>
                        </Select>
                        <Divider />
                        <div className="grid gap-3">
                            <Alert color="danger" description={`"Reconnect Box Billing" atau Mengganti COM Port akan menyebabkan Lampu mati sesaat.
`} title={"PERHATIAN"} />
                            <div>
                                <Button color="danger">Reconnect Box Billing</Button>
                            </div>
                        </div>
                    </div>
                </CardBody>
                <CardFooter className="justify-end">
                    <Button>Simpan Perubahan</Button>
                </CardFooter>
            </Card>
        </>
    )
}