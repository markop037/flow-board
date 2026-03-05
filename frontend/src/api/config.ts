/**
 * API base URL. Empty string = same origin (use with Vite proxy in dev).
 * Set VITE_API_BASE in .env when the backend is on another origin (e.g. preview or production).
 * Example: VITE_API_BASE=http://localhost:8001
 */
export const API_BASE = (import.meta.env.VITE_API_BASE as string) || ''
