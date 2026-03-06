import { useState } from 'react'
import { Calendar, Pencil, Trash2, ArrowRight, ArrowLeft } from 'lucide-react'
import type { Task, TaskStatus } from '../../types/task'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, TASK_STATUSES } from '../../types/task'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useUpdateTask, useDeleteTask } from '../../hooks/useTasks'
import { cn } from '../../lib/utils'

const priorityVariant = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

const statusBadgeVariant: Record<TaskStatus, 'todo' | 'inprogress' | 'done'> = {
  TO_DO: 'todo',
  IN_PROGRESS: 'inprogress',
  DONE: 'done',
}

const nextStatus: Partial<Record<TaskStatus, TaskStatus>> = {
  TO_DO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
}

const prevStatus: Partial<Record<TaskStatus, TaskStatus>> = {
  IN_PROGRESS: 'TO_DO',
  DONE: 'IN_PROGRESS',
}

/** Hover/focus colors for "move to X" links, matching section theme */
const statusLinkClasses: Record<TaskStatus, string> = {
  TO_DO: 'text-stone-500 hover:text-slate-600',
  IN_PROGRESS: 'text-stone-500 hover:text-indigo-600',
  DONE: 'text-stone-500 hover:text-emerald-600',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const next = nextStatus[task.status]
  const prev = prevStatus[task.status]

  const handleMove = (newStatus: TaskStatus) => {
    updateTask.mutate({ id: task.id, payload: { status: newStatus }, version: task.version })
  }

  const handleConfirmDelete = () => {
    deleteTask.mutate(task.id, { onSuccess: () => setDeleteConfirmOpen(false) })
  }

  return (
    <>
      <div className="group relative rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md hover:border-stone-300">
        {/* priority stripe */}
        <div
          className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
            task.priority === 'HIGH'
              ? 'bg-red-400'
              : task.priority === 'MEDIUM'
                ? 'bg-amber-400'
                : 'bg-sky-400'
          }`}
        />

        <div className="pl-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-snug tracking-tight text-stone-800">
              {task.title}
            </h3>
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                title="Edit task"
                className="h-8 w-8 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <Pencil size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteConfirmOpen(true)}
                title="Delete task"
                disabled={deleteTask.isPending}
                className="h-8 w-8 text-stone-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          {task.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-500">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={statusBadgeVariant[task.status]}>
              {TASK_STATUS_LABELS[task.status]}
            </Badge>
            <Badge variant={priorityVariant[task.priority]}>
              {TASK_PRIORITY_LABELS[task.priority]}
            </Badge>
            <span
              className="flex items-center gap-1 text-xs text-stone-400"
              title={`Updated ${formatDate(task.updated_at)}`}
            >
              <Calendar size={12} />
              {formatDate(task.updated_at)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {prev !== undefined && (
                <button
                  type="button"
                  onClick={() => handleMove(prev)}
                  disabled={updateTask.isPending}
                  title={`Move to ${TASK_STATUS_LABELS[prev]}`}
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50',
                    statusLinkClasses[prev],
                  )}
                >
                  <ArrowLeft size={12} />
                  {TASK_STATUS_LABELS[prev]}
                </button>
              )}
              {next !== undefined && (
                <button
                  type="button"
                  onClick={() => handleMove(next)}
                  disabled={updateTask.isPending}
                  title={`Move to ${TASK_STATUS_LABELS[next]}`}
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50',
                    statusLinkClasses[next],
                  )}
                >
                  {TASK_STATUS_LABELS[next]}
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete task"
        description={
          <>
            Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be
            undone.
          </>
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleteTask.isPending}
      />
    </>
  )
}

export { TASK_STATUSES }
