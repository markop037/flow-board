import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SlideOverProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function SlideOver({ open, onClose, title, children, className }: SlideOverProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slideover-title"
    >
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative z-10 flex w-full max-w-lg flex-col bg-white shadow-2xl',
          'animate-in fade-in duration-200',
          'sm:max-w-md',
          'md:max-w-lg',
          className,
        )}
        style={{
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);   opacity: 1; }
          }
        `}</style>
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 id="slideover-title" className="text-lg font-semibold tracking-tight text-stone-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto px-6 py-5"
          style={{ maxHeight: 'calc(100vh - 73px)' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
