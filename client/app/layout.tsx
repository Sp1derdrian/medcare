import type { Metadata, Viewport } from 'next'
import { Roboto } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const roboto = Roboto({ subsets: ['latin'],
  weight: ["400", "700"],
 })

export const metadata: Metadata = {
  title: 'MediCare Hospital - Dashboard',
  description: 'Modern hospital management system for healthcare professionals',
}

export const viewport: Viewport = {
  themeColor: '#00AEEF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
