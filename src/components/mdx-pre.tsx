'use client'

import { Check, Copy } from 'lucide-react'
import { type ComponentPropsWithoutRef, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

export function MdxPre(props: ComponentPropsWithoutRef<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = preRef.current?.innerText?.trimEnd()
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      // Keep silent when clipboard is unavailable.
    }
  }

  return (
    <div className='mdx-code-block'>
      <Button
        variant='ghost'
        size='icon-xs'
        className='mdx-code-copy cursor-pointer'
        onClick={handleCopy}
        aria-label={copied ? '已复制' : '复制代码'}
        title={copied ? '已复制' : '复制代码'}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </Button>
      <pre ref={preRef} {...props} />
    </div>
  )
}
