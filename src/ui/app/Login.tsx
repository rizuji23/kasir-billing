import { Card, CardBody } from "@heroui/card";
import Container from "../components/Container";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import logo from "../assets/logo-login.png"
import { useNavigate } from "react-router";

export default function Login() {
    const navigate = useNavigate();

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate("/dashboard")
    };

    return (
        <>
            <Container>
                <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-sm">
                        <div className="flex flex-col gap-6">
                            <Card>
                                <CardBody className="p-5">
                                    <div className="mb-4 mt-3 flex justify-center">
                                        <img src={logo} className="w-28" alt="" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-2xl !text-start font-medium">Login</p>
                                        <p className="text-sm text-muted-foreground">Masukkan Username Anda di bawah ini untuk masuk ke akun Anda</p>
                                    </div>
                                    <div className="mt-5">
                                        <Form className="w-full" validationBehavior="native" onSubmit={onSubmit}>
                                            <Input
                                                isRequired
                                                label="Username"
                                                name="username"
                                                errorMessage={"Silakan isi kolom ini."}
                                                placeholder="Masukan username disini"
                                                type="text"
                                            />
                                            <Input
                                                isRequired
                                                label="Password"
                                                name="password"
                                                errorMessage={"Silakan isi kolom ini."}
                                                placeholder="Masukan password disini"
                                                type="password"
                                            />

                                            <div className="w-full">
                                                <Button type="submit" className="w-full">
                                                    Login
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </div>
            </Container>
        </>
    )
}