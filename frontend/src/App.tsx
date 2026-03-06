import { useState } from 'react'
import { Plus, Kanban, LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthView } from './components/Auth/AuthView'
import { KanbanBoard } from './components/Board/KanbanBoard'
import { TaskModal } from './components/Task/TaskModal'
import { Button } from './components/ui/Button'
import { useTaskUpdatesWebSocket } from './hooks/useTaskUpdatesWebSocket'

function TaskUpdatesSubscriber() {
  useTaskUpdatesWebSocket()
  return null
}

function AuthenticatedApp() {
  const [createOpen, setCreateOpen] = useState(false)
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-violet-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Kanban size={16} />
            </div>
            <span className="text-base font-bold text-slate-800 sm:text-lg">Flow Board</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button size="sm" onClick={() => setCreateOpen(true)} className="sm:hidden">
              <Plus size={15} />
              <span>New</span>
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="hidden sm:inline-flex">
              <Plus size={16} />
              New Task
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Sign out"
              className="text-slate-500"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Live task updates for all users via WebSocket */}
      <TaskUpdatesSubscriber />

      {/* Board */}
      <main className="mx-auto max-w-screen-2xl px-4 py-5 sm:px-6 sm:py-8">
        <KanbanBoard />
      </main>

      {/* Global create modal */}
      <TaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        task={null}
        defaultStatus="TO_DO"
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

function AppRouter() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <AuthView />
  return <AuthenticatedApp />
}
