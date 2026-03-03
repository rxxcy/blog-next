'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

type HistoryBackButtonProps = {
  fallbackHref?: string
  className?: string
  children: ReactNode
}

export function HistoryBackButton({
  fallbackHref = '/',
  className,
  children,
}: HistoryBackButtonProps) {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(fallbackHref)
  }

  return (
    <button type='button' className={className} onClick={handleBack}>
      {children}
    </button>
  )
}
