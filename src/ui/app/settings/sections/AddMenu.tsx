import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

export default function AddMenu() {
    return (
        <>
            <div className="grid gap-5">
                <Card>
                    <CardHeader className="font-bold">Tambah Menu</CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <div className="grid gap-3">
                                    <Input
                                        isRequired
                                        label="Nama Menu"
                                        name="menu_name"
                                        errorMessage={"Silakan isi kolom ini."}
                                        placeholder="Masukan Nama Menu disini"
                                        type="text"
                                    />
                                    <Input
                                        isRequired
                                        label="Harga"
                                        name="price"
                                        errorMessage={"Silakan isi kolom ini."}
                                        placeholder="Masukan Harga disini"
                                        type="text"
                                    />
                                    <Select label="Pilih Kategori Menu" isRequired defaultSelectedKeys={"regular"}>
                                        <SelectItem key={"regular"}>Regular</SelectItem>
                                        <SelectItem key={"vip"}>VIP</SelectItem>
                                    </Select>
                                </div>
                            </div>
                            <div className="w-full h-fit p-4 bg-muted-foreground/20 rounded-md grid gap-4">
                                <div className="flex flex-col gap-3">
                                    <h3 className="font-bold">Detail Menu</h3>
                                    <Divider />
                                    <Input
                                        isRequired
                                        label="Harga Jual"
                                        name="price_sale"
                                        errorMessage={"Silakan isi kolom ini."}
                                        placeholder="Masukan Harga Jual disini"
                                        type="text"
                                    />
                                    <Input
                                        isRequired
                                        label="Modal"
                                        name="modal"
                                        errorMessage={"Silakan isi kolom ini."}
                                        placeholder="Masukan Modal disini"
                                        type="text"
                                    />
                                    <Input
                                        readOnly
                                        label="Keuntungan"
                                        name="price"
                                        errorMessage={"Silakan isi kolom ini."}
                                        type="text"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter className="justify-end">
                        <Button>Simpan Perubahan</Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader className="font-bold">List Menu</CardHeader>
                    <CardBody>

                    </CardBody>
                </Card>
            </div>
        </>
    )
}