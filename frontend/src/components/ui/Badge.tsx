import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'default' | 'low' | 'medium' | 'high' | 'todo' | 'inprogress' | 'done'

const variantClasses: Record<Variant, string> = {
  default: 'bg-slate-100 text-slate-700',
  low: 'bg-sky-100 text-sky-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700',
  todo: 'bg-slate-100 text-slate-600',
  inprogress: 'bg-violet-100 text-violet-700',
  done: 'bg-emerald-100 text-emerald-700',
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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
