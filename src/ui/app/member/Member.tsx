import { Card, CardBody } from "@heroui/card";
import MainLayout from "../../components/MainLayout";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Radio, RadioGroup } from "@heroui/radio";
import { Button, cn } from "@heroui/react";

export const CustomRadio = (props) => {
    const { children, ...otherProps } = props;

    return (
        <Radio
            {...otherProps}
            classNames={{
                base: cn(
                    "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                    "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
                    "data-[selected=true]:border-primary",
                ),
            }}
        >
            {children}
        </Radio>
    );
};

export default function MemberPage() {
    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-5">
                    <Card>
                        <CardBody className="p-5">
                            <div className="flex flex-col gap-4">
                                <div className="text-center">
                                    <h3 className="text-lg font-bold">Tambah Member</h3>
                                </div>
                                <Divider />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-3">
                                        <Input
                                            isRequired
                                            label="Nama Lengkap"
                                            name="full_name"
                                            errorMessage={"Silakan isi kolom ini."}
                                            placeholder="Masukan Nama Lengkap disini"
                                            type="text"
                                        />
                                        <Input
                                            isRequired
                                            label="Nomor Telepon"
                                            name="no_telp"
                                            errorMessage={"Silakan isi kolom ini."}
                                            placeholder="Masukan Nomor Telepon disini"
                                            type="number"
                                        />
                                        <Input
                                            isRequired
                                            label="Email"
                                            name="email"
                                            errorMessage={"Silakan isi kolom ini."}
                                            placeholder="Masukan Email disini"
                                            type="email"
                                        />
                                    </div>
                                    <div className="w-full h-fit p-4 bg-muted rounded-md grid gap-4">
                                        <div className="grid gap-3">
                                            <h3 className="font-bold">Jenis Member</h3>
                                            <RadioGroup orientation="horizontal">
                                                <CustomRadio value="free">
                                                    Premium
                                                </CustomRadio>
                                                <CustomRadio value="pro">
                                                    Gold
                                                </CustomRadio>
                                                <CustomRadio value="enterprise">
                                                    Platinum
                                                </CustomRadio>
                                            </RadioGroup>
                                        </div>
                                        <div className="grid gap-3">
                                            <h3 className="font-bold">Harga</h3>
                                            <div className="p-3 bg-default-200 rounded-md">
                                                <p><span className="font-bold">Rp. 60.000</span> Per bulan,<br />
                                                    dengan Potongan sebesar 3.5% & 10x kesempatan bermain.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button color="danger">Tambah Sekarang</Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>

                        </CardBody>
                    </Card>
                </div>
            </MainLayout>
        </>
    )
}