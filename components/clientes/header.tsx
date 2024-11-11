import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

const HeaderClient = async()=> {

    const session = await getServerSession(authOptions)

    if(session)

    return (
        <header className="flex flex-col w-full max-w-3xl mx-auto">
            <div className="flex flex-row justify-between items-center p-2">
                
            </div>
        </header>
    )
}

export default HeaderClient