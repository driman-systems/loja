import Provider from "@/lib/provider"
import "./globals.css";
import { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { CartProvider } from '@/components/produtos/carrinhoContext';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const montserrat = Montserrat({subsets: ['latin'], weight: ['300']})

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Finalizando...',
  icons: {
    icon: "/icon.png"
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const session = await getServerSession(authOptions);

  if(!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
  }

  return (
    <html lang="pt-BR">
      <body className={`${montserrat.className}`}>
        <CartProvider>
          <Provider session={session}> 
            {children}
          </Provider>
        </CartProvider>
      </body>
    </html>
  )
}
