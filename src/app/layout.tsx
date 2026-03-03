import type { Metadata } from 'next'
import { BackToTop } from '@/components/back-to-top'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { ThemeProvider } from '@/components/theme-provider'
import 'react-photo-view/dist/react-photo-view.css'
import './globals.css'

export const metadata: Metadata = {
  title: '若许闲乘月',
  description: '若许闲乘月博客',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='antialiased'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <div className='flex min-h-screen flex-col bg-background text-foreground'>
            <Navbar />
            <main className='mx-auto w-full max-w-4xl flex-1 px-0 py-10 md:px-6'>
              {children}
            </main>
            <Footer />
            <BackToTop />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
