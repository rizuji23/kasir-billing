import not_found from "../assets/not_found.png"
import { cn } from "../lib/utils"


export default function NotFound({ title = "Data Tidak Ditemukan", withoutimage = false, classNameText, classNameImage }: { title?: string, withoutimage?: boolean, classNameText?: string, classNameImage?: string }) {
    return (
        <>
            <div className="flex flex-col justify-center text-center my-10 gap-3">
                {
                    withoutimage === false && <div className="flex justify-center">
                        <img src={not_found} alt="" className={cn("w-[140px]", classNameImage)} />
                    </div>
                }

                <h3 className={cn("text-center font-bold text-lg", classNameText)}>{title}</h3>
            </div>
        </>
    )
}