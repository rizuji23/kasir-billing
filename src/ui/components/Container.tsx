import { cn } from "../lib/utils";

export default function Container({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <>
            <div
                className={cn(
                    "w-full p-5",
                    className,
                )}
            >
                {children}
            </div>
        </>
    );
}
