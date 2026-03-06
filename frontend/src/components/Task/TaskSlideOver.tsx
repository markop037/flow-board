import { useEffect, useState } from 'react'
import type { Task, TaskCreate, TaskPriority, TaskStatus } from '../../types/task'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '../../types/task'
import { useCreateTask, useReplaceTask } from '../../hooks/useTasks'
import { SlideOver } from '../ui/SlideOver'
import { Button } from '../ui/Button'

interface TaskSlideOverProps {
  open: boolean
  onClose: () => void
  task: Task | null
  defaultStatus?: TaskStatus
}

const emptyForm = (status: TaskStatus): TaskCreate => ({
  title: '',
  description: '',
  status,
  priority: 'MEDIUM',
})

const inputBase =
  'w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20'
const inputError = 'border-red-400 focus:border-red-400 focus:ring-red-400/20'

export function TaskSlideOver({
  open,
  onClose,
  task,
  defaultStatus = 'TO_DO',
}: TaskSlideOverProps) {
  const isEditing = task !== null
  const createTask = useCreateTask()
  const replaceTask = useReplaceTask()

  const [form, setForm] = useState<TaskCreate>(emptyForm(defaultStatus))
  const [errors, setErrors] = useState<Partial<Record<keyof TaskCreate, string>>>({})

  useEffect(() => {
    if (open) {
      setForm(
        task
          ? {
              title: task.title,
              description: task.description ?? '',
              status: task.status,
              priority: task.priority,
            }
          : emptyForm(defaultStatus),
      )
      setErrors({})
    }
  }, [open, task, defaultStatus])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TaskCreate, string>> = {}
    if (!form.title.trim()) newErrors.title = 'Title is required.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isPending = createTask.isPending || replaceTask.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload: TaskCreate = {
      ...form,
      description: form.description?.trim() || null,
    }

    if (isEditing && task) {
      replaceTask.mutate(
        { id: task.id, payload, version: task.version },
        { onSuccess: onClose },
      )
    } else {
      createTask.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'New Task'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-700" htmlFor="task-title">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Enter task title…"
            maxLength={255}
            className={errors.title ? `${inputBase} ${inputError}` : inputBase}
          />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-700" htmlFor="task-desc">
            Description
          </label>
          <textarea
            id="task-desc"
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional description…"
            rows={3}
            maxLength={65535}
            className={`resize-none ${inputBase}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700" htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))
              }
              className={`${inputBase} bg-white`}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700" htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))
              }
              className={`${inputBase} bg-white`}
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-stone-100 pt-5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </SlideOver>
  )
}
