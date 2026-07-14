import { useEffect, useRef, useState } from 'react'
import { GLOSSARY } from '../data/glossary'

/** A tappable jargon term. The Coach never assumes vocabulary. */
export function Term({ k, children }: { k?: string; children: string }) {
  const key = (k ?? children).toLowerCase()
  const def = GLOSSARY[key]
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  if (!def) return <>{children}</>

  return (
    <button
      type="button"
      className="term"
      ref={ref}
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
    >
      {children}
      {open && (
        <span className="term-pop" role="tooltip">
          <span className="t-name">{key}</span>
          {def}
        </span>
      )}
    </button>
  )
}
