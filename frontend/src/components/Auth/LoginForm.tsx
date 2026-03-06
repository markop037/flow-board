import { useState } from 'react'
import { Button } from '../ui/Button'
import { authApi } from '../../api/authApi'
import { useAuth } from '../../contexts/AuthContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export function LoginForm() {
  const { setToken } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const errors: string[] = []
  if (email && !EMAIL_RE.test(email)) errors.push('Enter a valid email address.')
  if (password && password.length < MIN_PASSWORD_LENGTH)
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
  const canSubmit = email.length > 0 && password.length >= MIN_PASSWORD_LENGTH && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!canSubmit) return
    setLoading(true)
    try {
      const data = await authApi.login({ username: email, password })
      setToken(data.access_token)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : 'Login failed.'
      setError(typeof msg === 'string' ? msg : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-800 placeholder-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
        {email && !EMAIL_RE.test(email) && (
          <p className="mt-1 text-xs text-red-600">Enter a valid email address.</p>
        )}
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="••••••••"
        />
        {password && password.length < MIN_PASSWORD_LENGTH && (
          <p className="mt-1 text-xs text-red-600">
            Password must be at least {MIN_PASSWORD_LENGTH} characters.
          </p>
        )}
      </div>
      <Button type="submit" disabled={!canSubmit} className="mt-1">
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
