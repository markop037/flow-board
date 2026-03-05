import { Pencil, Trash2, ArrowRight } from 'lucide-react'
import type { Task, TaskStatus } from '../../types/task'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, TASK_STATUSES } from '../../types/task'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useUpdateTask, useDeleteTask } from '../../hooks/useTasks'

const priorityVariant = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

const nextStatus: Partial<Record<TaskStatus, TaskStatus>> = {
  TO_DO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const next = nextStatus[task.status]

  const handleAdvance = () => {
    if (!next) return
    updateTask.mutate({ id: task.id, payload: { status: next }, version: task.version })
  }

  const handleDelete = () => {
    if (confirm(`Delete "${task.title}"?`)) {
      deleteTask.mutate(task.id)
    }
  }

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* priority stripe */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
          task.priority === 'HIGH'
            ? 'bg-rose-400'
            : task.priority === 'MEDIUM'
              ? 'bg-amber-400'
              : 'bg-sky-400'
        }`}
      />

      <div className="pl-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800 leading-snug">{task.title}</h3>
          <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              title="Edit task"
              className="h-7 w-7 text-slate-400 hover:text-violet-600"
            >
              <Pencil size={13} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              title="Delete task"
              disabled={deleteTask.isPending}
              className="h-7 w-7 text-slate-400 hover:text-rose-600"
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>

        {task.description && (
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <Badge variant={priorityVariant[task.priority]}>
            {TASK_PRIORITY_LABELS[task.priority]}
          </Badge>

          {next && (
            <button
              onClick={handleAdvance}
              disabled={updateTask.isPending}
              title={`Move to ${TASK_STATUS_LABELS[next]}`}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-600 transition-colors disabled:opacity-50"
            >
              {TASK_STATUS_LABELS[next]}
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Re-export so KanbanColumn can render a status selector inline
export { TASK_STATUSES }
