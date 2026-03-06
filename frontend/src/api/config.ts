/**
 * API base URL. Empty string = same origin (use with Vite proxy in dev).
 * Set VITE_API_BASE in .env when the backend is on another origin (e.g. preview or production).
 * Example: VITE_API_BASE=http://localhost:8001
 */
export const API_BASE = (import.meta.env.VITE_API_BASE as string) || ''

/** WebSocket URL for task updates (same origin as API). */
export function getTasksWebSocketUrl(): string {
  if (!API_BASE) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/ws/tasks`
  }
  const base = API_BASE.replace(/^http/, 'ws')
  return `${base}/ws/tasks`
}
