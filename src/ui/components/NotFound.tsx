import not_found from "../assets/not_found.png"


export default function NotFound({ title = "Data Tidak Ditemukan", withoutimage = false }: { title?: string, withoutimage?: boolean }) {
    return (
        <>
            <div className="flex flex-col justify-center text-center my-10 gap-3">
                {
                    withoutimage === false && <div className="flex justify-center">
                        <img src={not_found} alt="" className="w-[140px]" />
                    </div>
                }

                <h3 className="text-center font-bold text-lg">{title}</h3>
            </div>
        </>
    )
}