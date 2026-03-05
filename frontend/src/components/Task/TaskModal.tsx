import { useEffect, useState } from 'react'
import type { Task, TaskCreate, TaskPriority, TaskStatus } from '../../types/task'
import { TASK_PRIORITIES, TASK_PRIORITY_LABELS, TASK_STATUSES, TASK_STATUS_LABELS } from '../../types/task'
import { useCreateTask, useReplaceTask } from '../../hooks/useTasks'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface TaskModalProps {
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

export function TaskModal({ open, onClose, task, defaultStatus = 'TO_DO' }: TaskModalProps) {
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
    const newErrors: typeof errors = {}
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
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'New Task'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor="task-title">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Enter task title…"
            maxLength={255}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
              errors.title ? 'border-rose-400' : 'border-slate-200'
            }`}
          />
          {errors.title && (
            <p className="text-xs text-rose-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor="task-desc">
            Description
          </label>
          <textarea
            id="task-desc"
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional description…"
            rows={3}
            maxLength={65535}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Status & Priority row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
