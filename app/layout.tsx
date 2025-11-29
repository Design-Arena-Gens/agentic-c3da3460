import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartTeammates by Skyline',
  description: 'AI-powered teammate bot system with intelligent combat and configurable settings',
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
