import { useCallback, useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

export type CopyStatus = 'idle' | 'copied' | 'failed'

/** Copies the profile email and reports a short-lived status for inline feedback. */
export function useCopyEmail() {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const timer = useRef<number | null>(null)
  const copy = useCallback(async () => {
    const ok = await copyText(profile.email)
    setStatus(ok ? 'copied' : 'failed')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus('idle'), 1800)
  }, [])
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )
  return { status, copy }
}
