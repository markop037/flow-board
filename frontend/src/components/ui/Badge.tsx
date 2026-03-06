import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'default' | 'low' | 'medium' | 'high' | 'todo' | 'inprogress' | 'done'

const variantClasses: Record<Variant, string> = {
  default: 'bg-stone-100 text-stone-700',
  low: 'bg-sky-100 text-sky-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
  todo: 'bg-slate-100 text-slate-700',
  inprogress: 'bg-indigo-100 text-indigo-800',
  done: 'bg-emerald-100 text-emerald-800',
}

interface BadgeProps {
  variant?: Variant
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
