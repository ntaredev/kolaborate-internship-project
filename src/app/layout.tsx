import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegister from './sw-register'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AnchorID | Secure Digital Identity for Everyone',
    template: '%s | AnchorID',
  },
  description:
    'AnchorID enables refugees, stateless persons, and displaced individuals to securely hold and present digitally signed humanitarian credentials without relying on centralized identity databases.',
  keywords: ['digital identity', 'verifiable credentials', 'humanitarian', 'refugee', 'privacy'],
  authors: [{ name: 'AnchorID' }],
  creator: 'AnchorID',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AnchorID',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://anchorid.app',
    title: 'AnchorID | Secure Digital Identity',
    description: 'Decentralized refugee verifiable credential platform.',
    siteName: 'AnchorID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnchorID | Secure Digital Identity',
    description: 'Decentralized refugee verifiable credential platform.',
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b1326',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" dir="ltr">
      <head>
        {/* Material Symbols */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-on-surface min-h-screen`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
