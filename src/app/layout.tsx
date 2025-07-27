import type { Metadata } from 'next'
import { Poppins } from "next/font/google";
import './globals.css'
import { Toaster } from 'react-hot-toast'
import type { Viewport } from 'next';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: '--font-poppins'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
};

export const metadata: Metadata = {
  title: 'Phasely - AI Learning Planner',
  description: 'Create personalized learning schedules with AI assistance',
  keywords: 'learning, AI, calendar, education, planning, schedule',
  authors: [{ name: 'Phasely Team' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`scroll-smooth ${poppins.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-funnel max-w-screen bg-gray-50 min-h-screen antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}