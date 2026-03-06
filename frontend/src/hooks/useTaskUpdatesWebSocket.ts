import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getTasksWebSocketUrl } from '../api/config'
import { TASKS_KEY } from './useTasks'

type TaskUpdateEvent = 'task_created' | 'task_updated' | 'task_deleted'

interface TaskUpdateMessage {
  event: TaskUpdateEvent
  task: unknown
}

/**
 * Subscribes to the task-updates WebSocket and invalidates the tasks query
 * when any task is created, updated, or deleted (so the UI refetches and stays in sync for all users).
 * Use once inside the authenticated app layout.
 */
export function useTaskUpdatesWebSocket() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const url = getTasksWebSocketUrl()
    const connect = () => {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as TaskUpdateMessage
          if (
            msg.event === 'task_created' ||
            msg.event === 'task_updated' ||
            msg.event === 'task_deleted'
          ) {
            queryClient.invalidateQueries({ queryKey: TASKS_KEY })
          }
        } catch {
          // ignore non-JSON or unexpected payloads
        }
      }

      ws.onclose = () => {
        wsRef.current = null
        reconnectTimeoutRef.current = setTimeout(connect, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [queryClient])
}
