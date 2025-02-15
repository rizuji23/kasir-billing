import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";

export default function PrinterApi() {
    return (
        <>
            <Card className="h-fit">
                <CardHeader className="font-bold">Printer</CardHeader>
                <CardBody>
                    <div className="grid gap-3">
                        <Select label="Nama Printer" placeholder="Pilih Printer disini">
                            <SelectItem key={"Printer 1"}>Printer 1</SelectItem>
                            <SelectItem key={"Printer 2"}>Printer 2</SelectItem>
                            <SelectItem key={"Printer 3"}>Printer 3</SelectItem>
                        </Select>
                    </div>
                </CardBody>
                <CardFooter className="justify-end">
                    <Button>Simpan Perubahan</Button>
                </CardFooter>
            </Card>
        </>
    )
}