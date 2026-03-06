import { useState, type ReactNode } from 'react'
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'

interface DashboardLayoutProps {
  children: ReactNode
  headerActions?: ReactNode
  mainTitle?: string
  onLogout?: () => void
}

export function DashboardLayout({
  children,
  headerActions,
  mainTitle = 'Board',
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar — dark panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-stone-900 transition-transform duration-200 ease-out lg:static lg:z-0 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-stone-800 px-5 lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/25">
              <LayoutDashboard size={20} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Flow Board</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl p-2.5 text-stone-400 transition-colors hover:bg-stone-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          <a
            href="#board"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={18} className="text-stone-500" />
            Board
          </a>
        </nav>

        <div className="border-t border-stone-800 p-3">
          {onLogout && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-stone-400 hover:bg-stone-800 hover:text-white"
              onClick={onLogout}
            >
              <LogOut size={18} />
              Sign out
            </Button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-stone-200 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="truncate text-lg font-semibold tracking-tight text-stone-800">
            {mainTitle}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {headerActions}
          </div>
        </header>

        <main id="board" className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
