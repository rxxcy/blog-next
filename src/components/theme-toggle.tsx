'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className='h-9 w-9' aria-hidden='true' />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant='ghost'
      aria-label='切换主题'
      title='切换主题'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='inline-flex h-9 w-9 items-center justify-center rounded-full   text-foreground/80 transition-colors hover:text-foreground cursor-pointer'
    >
      {isDark ? (
        <Sun className='h-4 w-4' aria-hidden='true' />
      ) : (
        <Moon className='h-4 w-4' aria-hidden='true' />
      )}
    </Button>
  )
}
