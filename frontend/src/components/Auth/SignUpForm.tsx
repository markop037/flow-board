import { useState } from 'react'
import { Button } from '../ui/Button'
import { authApi } from '../../api/authApi'
import { useAuth } from '../../contexts/AuthContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export function SignUpForm() {
  const { setToken } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit =
    email.length > 0 &&
    EMAIL_RE.test(email) &&
    password.length >= MIN_PASSWORD_LENGTH &&
    !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!canSubmit) return
    setLoading(true)
    try {
      const data = await authApi.signup({
        email,
        password,
        full_name: fullName.trim() || undefined,
      })
      setToken(data.access_token)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : 'Sign up failed.'
      setError(typeof msg === 'string' ? msg : 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-700" role="alert">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="you@example.com"
        />
        {email && !EMAIL_RE.test(email) && (
          <p className="mt-1 text-xs text-rose-600">Enter a valid email address.</p>
        )}
      </div>
      <div>
        <label htmlFor="signup-password" className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="At least 8 characters"
        />
        {password && password.length < MIN_PASSWORD_LENGTH && (
          <p className="mt-1 text-xs text-rose-600">
            Password must be at least {MIN_PASSWORD_LENGTH} characters.
          </p>
        )}
      </div>
      <div>
        <label htmlFor="signup-name" className="mb-1 block text-sm font-medium text-slate-700">
          Full name <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="Jane Doe"
        />
      </div>
      <Button type="submit" disabled={!canSubmit} className="mt-1">
        {loading ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
