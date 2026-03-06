import { useState, useMemo } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useTasks } from '../../hooks/useTasks'
import { TASK_STATUSES, TASK_STATUS_LABELS } from '../../types/task'
import type { Task, TaskStatus } from '../../types/task'
import { KanbanColumn } from './KanbanColumn'
import { TaskToolbar, type SortOption } from './TaskToolbar'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

interface KanbanBoardProps {
  onOpenCreate: (status: TaskStatus) => void
  onOpenEdit: (task: Task, status: TaskStatus) => void
}

const PRIORITY_ORDER: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 }

const tabDot: Record<TaskStatus, string> = {
  TO_DO: 'bg-slate-500',
  IN_PROGRESS: 'bg-indigo-500',
  DONE: 'bg-emerald-500',
}

const tabActiveBg: Record<TaskStatus, string> = {
  TO_DO: 'bg-slate-600 text-white',
  IN_PROGRESS: 'bg-indigo-600 text-white',
  DONE: 'bg-emerald-600 text-white',
}

function filterAndSortTasks(
  tasks: Task[],
  searchQuery: string,
  sortOption: SortOption,
): Task[] {
  const q = searchQuery.trim().toLowerCase()
  let list = q
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q),
      )
    : [...tasks]

  const sort = sortOption as SortOption
  if (sort === 'date_desc') {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sort === 'date_asc') {
    list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  } else if (sort === 'priority_desc') {
    list.sort((a, b) => (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0))
  } else if (sort === 'priority_asc') {
    list.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 0) - (PRIORITY_ORDER[b.priority] ?? 0))
  } else if (sort === 'name_asc') {
    list.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
  } else if (sort === 'name_desc') {
    list.sort((a, b) => b.title.localeCompare(a.title, undefined, { sensitivity: 'base' }))
  }
  return list
}

export function KanbanBoard({ onOpenCreate, onOpenEdit }: KanbanBoardProps) {
  const { data: tasks, isLoading, isError, error, refetch } = useTasks()
  const [activeTab, setActiveTab] = useState<TaskStatus>('TO_DO')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('date_desc')

  const openEdit = (task: Task) => onOpenEdit(task, task.status)

  const filteredAndSorted = useMemo(
    () => filterAndSortTasks(tasks ?? [], searchQuery, sortOption),
    [tasks, searchQuery, sortOption],
  )

  const tasksByStatus = useMemo(
    () =>
      TASK_STATUSES.reduce<Record<TaskStatus, Task[]>>(
        (acc, status) => {
          acc[status] = filteredAndSorted.filter((t) => t.status === status)
          return acc
        },
        { TO_DO: [], IN_PROGRESS: [], DONE: [] },
      ),
    [filteredAndSorted],
  )

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex items-center gap-2 text-red-600">
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

  return (
    <>
      <div className="space-y-5">
        <TaskToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        {/* Mobile tab bar */}
        <div className="flex rounded-2xl border border-stone-200 bg-white p-1.5 shadow-sm lg:hidden">
          {TASK_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveTab(status)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all duration-150',
                activeTab === status ? `${tabActiveBg[status]} shadow-sm` : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
              )}
            >
              <span
                className={cn(
                  'hidden h-2 w-2 rounded-full sm:inline-block',
                  activeTab === status ? 'bg-white/80' : tabDot[status],
                )}
              />
              <span className="hidden sm:inline">{TASK_STATUS_LABELS[status]}</span>
              <span className="sm:hidden">
                {status === 'TO_DO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Prog.' : 'Done'}
              </span>
              <span
                className={cn(
                  'rounded-lg px-2 py-0.5 text-xs font-semibold',
                  activeTab === status ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600',
                )}
              >
                {tasksByStatus[status].length}
              </span>
            </button>
          ))}
        </div>

        <div className="lg:hidden">
          <KanbanColumn
            status={activeTab}
            tasks={tasksByStatus[activeTab]}
            onAddTask={onOpenCreate}
            onEditTask={openEdit}
            mobile
          />
        </div>

        <div className="hidden lg:flex lg:gap-6 lg:overflow-x-auto lg:pb-4">
          {TASK_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onAddTask={onOpenCreate}
              onEditTask={openEdit}
            />
          ))}
        </div>
      </div>
    </>
  )
}
