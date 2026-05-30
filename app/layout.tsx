import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ascend',
  description: 'Train Smarter. Progress Faster. Rank Higher.',
  openGraph: {
    title: 'Ascend',
    description: 'Train Smarter. Progress Faster. Rank Higher.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ascend Fitness App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ascend',
    description: 'Train Smarter. Progress Faster. Rank Higher.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-gray-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
