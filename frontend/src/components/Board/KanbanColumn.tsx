import { Plus } from 'lucide-react'
import type { Task, TaskStatus } from '../../types/task'
import { TASK_STATUS_LABELS } from '../../types/task'
import { TaskCard } from '../Task/TaskCard'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

const columnStyles: Record<TaskStatus, { header: string; dot: string; count: string }> = {
  TO_DO: {
    header: 'text-slate-700',
    dot: 'bg-slate-500',
    count: 'bg-slate-100 text-slate-700',
  },
  IN_PROGRESS: {
    header: 'text-indigo-700',
    dot: 'bg-indigo-500',
    count: 'bg-indigo-50 text-indigo-700',
  },
  DONE: {
    header: 'text-emerald-700',
    dot: 'bg-emerald-500',
    count: 'bg-emerald-50 text-emerald-700',
  },
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onAddTask: (defaultStatus: TaskStatus) => void
  onEditTask: (task: Task) => void
  mobile?: boolean
}

export function KanbanColumn({ status, tasks, onAddTask, onEditTask, mobile }: KanbanColumnProps) {
  const styles = columnStyles[status]

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-stone-200 bg-white shadow-sm',
        mobile ? 'w-full' : 'w-80 shrink-0',
      )}
    >
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className={cn('h-2.5 w-2.5 rounded-full', styles.dot)} />
          <span className={cn('text-sm font-semibold tracking-tight', styles.header)}>
            {TASK_STATUS_LABELS[status]}
          </span>
          <span className={cn('rounded-lg px-2.5 py-0.5 text-xs font-medium', styles.count)}>
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAddTask(status)}
          title={`Add task to ${TASK_STATUS_LABELS[status]}`}
          className="h-9 w-9 text-stone-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
        >
          <Plus size={17} />
        </Button>
      </div>

      <div
        className="flex flex-col gap-3 overflow-y-auto p-3"
        style={{ maxHeight: mobile ? 'calc(100dvh - 240px)' : 'calc(100vh - 220px)' }}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 text-3xl opacity-50">📋</div>
            <p className="text-sm text-stone-400">No tasks yet</p>
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
