import { useState } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useTasks } from '../../hooks/useTasks'
import { TASK_STATUSES, TASK_STATUS_LABELS } from '../../types/task'
import type { Task, TaskStatus } from '../../types/task'
import { KanbanColumn } from './KanbanColumn'
import { TaskModal } from '../Task/TaskModal'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

const tabDot: Record<TaskStatus, string> = {
  TO_DO: 'bg-slate-400',
  IN_PROGRESS: 'bg-violet-500',
  DONE: 'bg-emerald-500',
}

export function KanbanBoard() {
  const { data: tasks, isLoading, isError, error, refetch } = useTasks()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('TO_DO')
  const [activeTab, setActiveTab] = useState<TaskStatus>('TO_DO')

  const openCreate = (status: TaskStatus) => {
    setEditingTask(null)
    setDefaultStatus(status)
    setModalOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setDefaultStatus(task.status)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle size={20} />
          <span className="font-medium">
            {error instanceof Error ? error.message : 'Failed to load tasks'}
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw size={14} />
          Retry
        </Button>
      </div>
    )
  }

  const tasksByStatus = TASK_STATUSES.reduce<Record<TaskStatus, Task[]>>(
    (acc, status) => {
      acc[status] = (tasks ?? []).filter((t) => t.status === status)
      return acc
    },
    { TO_DO: [], IN_PROGRESS: [], DONE: [] },
  )

  return (
    <>
      {/* ── Mobile tab bar (hidden on lg+) ─────────────────────── */}
      <div className="mb-4 flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm lg:hidden">
        {TASK_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors',
              activeTab === status
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            <span
              className={cn(
                'hidden h-2 w-2 rounded-full sm:inline-block',
                activeTab === status ? 'bg-white/70' : tabDot[status],
              )}
            />
            <span className="hidden sm:inline">{TASK_STATUS_LABELS[status]}</span>
            {/* Very small screens: abbreviation */}
            <span className="sm:hidden">
              {status === 'TO_DO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Prog.' : 'Done'}
            </span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-xs font-bold',
                activeTab === status
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600',
              )}
            >
              {tasksByStatus[status].length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Mobile: single active column ───────────────────────── */}
      <div className="lg:hidden">
        <KanbanColumn
          status={activeTab}
          tasks={tasksByStatus[activeTab]}
          onAddTask={openCreate}
          onEditTask={openEdit}
          mobile
        />
      </div>

      {/* ── Desktop: all columns side-by-side ──────────────────── */}
      <div className="hidden lg:flex lg:gap-5 lg:overflow-x-auto lg:pb-4">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onAddTask={openCreate}
            onEditTask={openEdit}
          />
        ))}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={closeModal}
        task={editingTask}
        defaultStatus={defaultStatus}
      />
    </>
  )
}
