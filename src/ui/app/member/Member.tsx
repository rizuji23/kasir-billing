import { Card, CardBody, CardHeader } from "@heroui/card";
import MainLayout from "../../components/MainLayout";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Radio, RadioGroup, RadioProps } from "@heroui/radio";
import { Button, Chip, cn, Form } from "@heroui/react";
import { useEffect, useState } from "react";
import { Members, PriceMember } from "../../../electron/types";
import { toast } from "sonner";
import { TableColumn } from "react-data-table-component";
import DataTableCustom from "../../components/datatable/DataTableCustom";
import { IResponses } from "../../../electron/lib/responses";
import { convertRupiah } from "../../lib/utils";
import { Trash } from "lucide-react";

export const CustomRadio = (props: RadioProps) => {
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
    const columns: TableColumn<Members>[] = [
        {
            name: "Nama Lengkap",
            selector: row => row.name,
            sortable: true,
            cell: row => <button onClick={() => handleUpdate(row)} className="text-blue-500 hover:underline">{row.name}</button>
        },
        {
            name: "Nomor Telepon",
            selector: row => row.no_telp,
        },
        {
            name: "Email",
            selector: row => row.email,
        },
        {
            name: "Tipe Member",
            selector: row => row.type_member,
            cell: row => <Chip className="capitalize">{row.type_member}</Chip>
        },
        {
            name: "Actions",
            cell: row => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        color="danger"
                        onPress={() => handleDelete(row)}
                        isIconOnly
                    >
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ]

    const handleUpdate = async (row: Members) => {
        if (!row.id) {
            toast.error("ID Member tidak ditemukan");
        }

        setDataMember({
            name: row.name,
            no_telp: row.no_telp,
            email: row.email
        });

        setId(row.id_member)
        setSelected(row.type_member);
    }

    const handleDelete = async (row: Members) => {
        if (confirm(`Apakah anda yakin ingin menghapus "${row.name}"?`)) {
            try {
                if (row.id) {
                    const res = await window.api.delete_member(row.id);

                    if (res.status) {
                        toast.success("Members berhasil dihapus");
                        getMembers();
                    } else {
                        toast.error(res.detail_message || "Gagal menghapus Members");
                    }
                } else {
                    toast.error("ID Members tidak ada.");
                }

            } catch (err) {
                toast.error(`Error deleting Members: ${err}`);
            }
        }
    }

    const [members, setMembers] = useState<Members[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [price, setPrice] = useState<PriceMember | null>(null);
    const [selected, setSelected] = useState<string>("PREMIUM");
    const [loading_btn, setLoadingBtn] = useState<boolean>(false);
    const [id, setId] = useState<string | null>(null);

    const [data_member, setDataMember] = useState<{
        name: string,
        no_telp: string,
        email: string,
    }>({
        name: "",
        no_telp: "",
        email: ""
    })

    const getMembers = async () => {
        setLoading(true);
        try {
            const res = await window.api.list_member();
            setLoading(false);
            if (res.status && res.data) {
                setMembers(res.data);
            }
        } catch (err) {
            setLoading(false);
            toast.error(`Error fetching members: ${err}`);
        }
    }

    const getMemberPrice = async () => {
        setLoading(true);
        try {
            const res = await window.api.get_type(selected) as IResponses<PriceMember>;
            console.log("res", res);
            setLoading(false);
            if (res.status && res.data) {
                setPrice(res.data);
            }
        } catch (err) {
            setLoading(false);
            toast.error(`Error fetching members: ${err}`);
        }
    }

    useEffect(() => {
        getMembers();
    }, []);

    useEffect(() => {
        getMemberPrice();
    }, [selected]);

    const deleteFieldValue = () => {
        setDataMember({
            name: "",
            no_telp: "",
            email: ""
        })

        setSelected("Premium")
        setId(null)
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

        try {
            let res;

            if (!id) {
                res = await window.api.add_member({ ...data, type_member: selected });
            } else {
                res = await window.api.update_member(id, { ...data, type_member: selected })
            }

            console.log(id, { ...data, type_member: selected })

            console.log("res", res)

            setLoadingBtn(false);

            if (res?.status) {
                getMembers();
                toast.success(`Menu berhasil ${id ? "diubah" : "ditambahkan"}`);
                deleteFieldValue();
            }

        } catch (err) {
            setLoadingBtn(false)
            toast.error(`Gagal menambahkan Menu: ${err}`);
        }
    }

    return (
        <>
            <MainLayout>
                <div className="flex flex-col gap-5">
                    <Card>
                        <CardBody className="p-5">
                            <Form className="!block" validationBehavior="native" onSubmit={onSubmit}>
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
                                                name="name"
                                                errorMessage={"Silakan isi kolom ini."}
                                                placeholder="Masukan Nama Lengkap disini"
                                                type="text"
                                                onChange={(e) => setDataMember((prevState) => ({
                                                    ...prevState,
                                                    name: e.target.value
                                                }))}
                                                value={data_member.name}
                                            />
                                            <Input
                                                isRequired
                                                label="Nomor Telepon"
                                                name="no_telp"
                                                errorMessage={"Silakan isi kolom ini."}
                                                placeholder="Masukan Nomor Telepon disini"
                                                type="number"
                                                onChange={(e) => setDataMember((prevState) => ({
                                                    ...prevState,
                                                    no_telp: e.target.value
                                                }))}
                                                value={data_member.no_telp}
                                            />
                                            <Input
                                                isRequired
                                                label="Email"
                                                name="email"
                                                errorMessage={"Silakan isi kolom ini."}
                                                placeholder="Masukan Email disini"
                                                type="email"
                                                onChange={(e) => setDataMember((prevState) => ({
                                                    ...prevState,
                                                    email: e.target.value
                                                }))}
                                                value={data_member.email}
                                            />
                                        </div>
                                        <div className="w-full h-fit p-4 bg-muted rounded-md grid gap-4">
                                            <div className="grid gap-3">
                                                <h3 className="font-bold">Jenis Member</h3>
                                                <RadioGroup orientation="horizontal" onValueChange={setSelected} value={selected}>
                                                    <CustomRadio value="PREMIUM">
                                                        Premium
                                                    </CustomRadio>
                                                    <CustomRadio value="GOLD">
                                                        Gold
                                                    </CustomRadio>
                                                    <CustomRadio value="PLATINUM">
                                                        Platinum
                                                    </CustomRadio>
                                                </RadioGroup>
                                            </div>
                                            <div className="grid gap-3">
                                                <h3 className="font-bold">Harga</h3>
                                                <div className="p-3 bg-default-200 rounded-md">
                                                    <p><span className="font-bold">Rp. {convertRupiah(price?.price.toString() || "0")}</span> Per bulan,<br />
                                                        dengan Potongan sebesar <b>{price?.discount || 0}% & {price?.playing || 0}x</b> kesempatan bermain.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button color="danger" type="submit" isLoading={loading_btn}>Tambah Sekarang</Button>
                                    </div>
                                </div>
                            </Form>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader>List Member</CardHeader>
                        <CardBody>
                            <DataTableCustom columns={columns} data={members} progressPending={loading} pagination />
                        </CardBody>
                    </Card>
                </div>
            </MainLayout>
        </>
    )
}