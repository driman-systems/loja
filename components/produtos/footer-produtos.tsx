import Image from "next/image";
import Link from "next/link";

export default function FooterProducts() {

    const date = new Date()

    const ano = date.getFullYear();

    return (
        <footer className="flex flex-col w-full justify-center items-center mt-16 pb-6">
                <Link href={"https://driman.com.br"} target="_blank">
                    <Image src={'/logo.png'} alt="Driman Systems" width={80} height={28} />
                </Link>
                <span className="text-xs py-2">&copy; {ano}</span>
        </footer>
    )
}