import Provider from "@/lib/provider"
import "./globals.css";
import { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { CartProvider } from '@/components/produtos/carrinhoContext';

const montserrat = Montserrat({subsets: ['latin'], weight: ['300']})

export const metadata: Metadata = {
  title: 'Página de produto',
  description: 'O melhor da Serra Gaúcha',
  icons: {
    icon: "/icon.png"
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.className}`}>
        <CartProvider>
          <Provider>
            {children}
          </Provider>
        </CartProvider>
      </body>
    </html>
  )
}
