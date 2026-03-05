import { Plus } from 'lucide-react'
import type { Task, TaskStatus } from '../../types/task'
import { TASK_STATUS_LABELS } from '../../types/task'
import { TaskCard } from '../Task/TaskCard'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

const columnStyles: Record<TaskStatus, { header: string; dot: string; count: string }> = {
  TO_DO: {
    header: 'text-slate-700',
    dot: 'bg-slate-400',
    count: 'bg-slate-100 text-slate-600',
  },
  IN_PROGRESS: {
    header: 'text-violet-700',
    dot: 'bg-violet-500',
    count: 'bg-violet-100 text-violet-700',
  },
  DONE: {
    header: 'text-emerald-700',
    dot: 'bg-emerald-500',
    count: 'bg-emerald-100 text-emerald-700',
  },
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onAddTask: (defaultStatus: TaskStatus) => void
  onEditTask: (task: Task) => void
  /** When true the column fills its container width (used on mobile). */
  mobile?: boolean
}

export function KanbanColumn({ status, tasks, onAddTask, onEditTask, mobile }: KanbanColumnProps) {
  const styles = columnStyles[status]

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl bg-slate-50 border border-slate-200',
        mobile ? 'w-full' : 'w-80 shrink-0',
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full', styles.dot)} />
          <span className={cn('text-sm font-semibold', styles.header)}>
            {TASK_STATUS_LABELS[status]}
          </span>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', styles.count)}>
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAddTask(status)}
          title={`Add task to ${TASK_STATUS_LABELS[status]}`}
          className="h-7 w-7 text-slate-400 hover:text-violet-600"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Task list */}
      <div
        className="flex flex-col gap-3 overflow-y-auto p-3"
        style={{ maxHeight: mobile ? 'calc(100dvh - 200px)' : 'calc(100vh - 180px)' }}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-2 text-2xl">📋</div>
            <p className="text-xs text-slate-400">No tasks yet</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))
        )}
      </div>
    </div>
  )
}
