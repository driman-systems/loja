import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';
import Provider from "@/lib/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Controle de venda de produtos",
  icons: {
    icon: "/icon.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    // Redireciona para a página de login se não estiver autenticado
    redirect("/login");
  }

  if (session.user.role !== "Admin") {
    // Redireciona para a página de usuário se não for admin
    redirect("/painel");
  }

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} flex bg-gray-900 text-white min-h-screen`}>
        <Provider>
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-2">
            {children}
          </main>
        </div>
        </Provider>
      </body>
    </html>
  );
}
