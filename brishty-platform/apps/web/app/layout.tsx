import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sensy | Document Intelligence',
  description: 'AI document-processing platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
