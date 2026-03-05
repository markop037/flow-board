import { useState } from 'react'
import { Plus, Kanban, RefreshCw } from 'lucide-react'
import { KanbanBoard } from './components/Board/KanbanBoard'
import { TaskModal } from './components/Task/TaskModal'
import { Button } from './components/ui/Button'
import { useQueryClient } from '@tanstack/react-query'
import { TASKS_KEY } from './hooks/useTasks'

export default function App() {
  const [createOpen, setCreateOpen] = useState(false)
  const qc = useQueryClient()

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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => qc.invalidateQueries({ queryKey: TASKS_KEY })}
              title="Refresh tasks"
              className="text-slate-500"
            >
              <RefreshCw size={16} />
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="sm:hidden">
              <Plus size={15} />
              <span>New</span>
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="hidden sm:inline-flex">
              <Plus size={16} />
              New Task
            </Button>
          </div>
        </div>
      </header>

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
