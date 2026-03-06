import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthView } from './components/Auth/AuthView'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { KanbanBoard } from './components/Board/KanbanBoard'
import { TaskSlideOver } from './components/Task/TaskSlideOver'
import { Button } from './components/ui/Button'
import { useTaskUpdatesWebSocket } from './hooks/useTaskUpdatesWebSocket'
import type { Task, TaskStatus } from './types/task'

function TaskUpdatesSubscriber() {
  useTaskUpdatesWebSocket()
  return null
}

function AuthenticatedApp() {
  const { logout } = useAuth()
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('TO_DO')

  const openCreate = () => {
    setEditingTask(null)
    setDefaultStatus('TO_DO')
    setSlideOverOpen(true)
  }

  const openEdit = (task: Task, status: TaskStatus) => {
    setEditingTask(task)
    setDefaultStatus(status)
    setSlideOverOpen(true)
  }

  const openCreateInColumn = (status: TaskStatus) => {
    setEditingTask(null)
    setDefaultStatus(status)
    setSlideOverOpen(true)
  }

  const closeSlideOver = () => {
    setSlideOverOpen(false)
    setEditingTask(null)
  }

  return (
    <DashboardLayout
      mainTitle="Board"
      onLogout={logout}
      headerActions={
        <>
          <Button size="sm" onClick={openCreate} className="sm:hidden">
            <Plus size={16} />
            New
          </Button>
          <Button onClick={openCreate} className="hidden sm:inline-flex">
            <Plus size={16} />
            New Task
          </Button>
        </>
      }
    >
      <TaskUpdatesSubscriber />
      <KanbanBoard
        onOpenCreate={openCreateInColumn}
        onOpenEdit={openEdit}
      />
      <TaskSlideOver
        open={slideOverOpen}
        onClose={closeSlideOver}
        task={editingTask}
        defaultStatus={defaultStatus}
      />
    </DashboardLayout>
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
