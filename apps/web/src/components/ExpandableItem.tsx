import { useState } from 'react'

export interface ExpandableItemData {
  label: string
  detail: string
}

export default function ExpandableItem({ label, detail }: ExpandableItemData) {
  const [open, setOpen] = useState(false)
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="flex items-start gap-2 w-full text-left group"
      >
        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
        <span className="text-sm flex-1">{label}</span>
        <span className="text-xs opacity-40 group-hover:opacity-70 shrink-0 mt-0.5" aria-hidden>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <p className="mt-1.5 ml-3.5 text-xs opacity-70 leading-relaxed border-l-2 border-current/20 pl-3">
          {detail}
        </p>
      )}
    </li>
  )
}
