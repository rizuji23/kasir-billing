import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { PressEvent } from "@react-types/shared";
import { Minus, Plus } from "lucide-react";

export default function InputQty({ onPressPlus, onPressMinus, value, show_plus = true }: { onPressPlus: (e: PressEvent) => void, onPressMinus: (e: PressEvent) => void, value: string | (readonly string[] & string), show_plus?: boolean }) {
    return (
        <>
            <Input
                size="sm"
                className="max-w-[100px]"
                classNames={{ inputWrapper: "!px-0 !text-center bg-default-200", input: "!text-center" }}
                value={value}
                isReadOnly
                startContent={
                    <Button
                        size="sm"
                        color="success"
                        isIconOnly
                        onPress={onPressMinus}
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                }
                endContent={
                    show_plus && <Button
                        size="sm"
                        color="success"
                        isIconOnly
                        onPress={onPressPlus}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                }
                readOnly
            />
        </>
    )
}