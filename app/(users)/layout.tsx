import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeaderClient from '@/components/clientes/header'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Área de usuários",
  description: "Controle de venda de produtos",
  icons: {
    icon: '/icon.png'
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
}

export default async function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession(authOptions);

  if(session) {
    if (session.user.role !== "Admin") {
      redirect("/painel");
    } else {
      redirect("/")
    }   
  }

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} flex bg-gray-900 text-white min-h-screen p-2`}>
        <HeaderClient />
        {children}
      </body>
    </html>
  );
}
