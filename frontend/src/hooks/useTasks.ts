import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { taskApi } from '../api/taskApi'
import type { TaskCreate, TaskUpdate } from '../types/task'

export const TASKS_KEY = ['tasks'] as const

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: () => taskApi.list({ size: 100, sort_by: 'created_at', sort_order: 'desc' }),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TaskCreate) => taskApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
      version,
    }: {
      id: string
      payload: TaskUpdate
      version?: number
    }) => taskApi.patch(id, payload, version),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useReplaceTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
      version,
    }: {
      id: string
      payload: TaskCreate
      version: number
    }) => taskApi.replace(id, payload, version),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}
