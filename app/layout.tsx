
import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'La Casa de Rosi',
  description: 'Plataforma gastronómica y planificador de comidas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
<html lang="es" suppressHydrationWarning>
      <body className="bg-[#fcfaf7] min-h-screen flex flex-col text-stone-900 font-sans">
       <Providers>
        <Navbar />
        <main className="flex-grow w-full">
          {children}
        </main>
        <Footer />
      </Providers>
      </body>
    </html>
  )
}