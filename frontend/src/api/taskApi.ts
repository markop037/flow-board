import axios from 'axios'
import type { Task, TaskCreate, TaskListParams, TaskUpdate } from '../types/task'

const http = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export const taskApi = {
  list(params?: TaskListParams): Promise<Task[]> {
    return http.get<Task[]>('/tasks/', { params }).then((r) => r.data)
  },

  get(id: string): Promise<Task> {
    return http.get<Task>(`/tasks/${id}`).then((r) => r.data)
  },

  create(payload: TaskCreate): Promise<Task> {
    return http.post<Task>('/tasks/', payload).then((r) => r.data)
  },

  /** Full replace – requires the current version for optimistic locking. */
  replace(id: string, payload: TaskCreate, version: number): Promise<Task> {
    return http
      .put<Task>(`/tasks/${id}`, payload, { params: { version } })
      .then((r) => r.data)
  },

  /** Partial update – optionally pass version for optimistic locking. */
  patch(id: string, payload: TaskUpdate, version?: number): Promise<Task> {
    return http
      .patch<Task>(`/tasks/${id}`, payload, {
        params: version !== undefined ? { version } : undefined,
      })
      .then((r) => r.data)
  },

  delete(id: string): Promise<void> {
    return http.delete(`/tasks/${id}`).then(() => undefined)
  },
}
