import { useState } from 'react'
import { Kanban } from 'lucide-react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { cn } from '../../lib/utils'

type Tab = 'login' | 'signup'

export function AuthView() {
  const [tab, setTab] = useState<Tab>('login')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-violet-50 px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Kanban size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Flow Board</h1>
          <p className="text-sm text-slate-500">Sign in or create an account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
          {/* Tabs */}
          <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                tab === 'login'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                tab === 'signup'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              )}
            >
              Sign up
            </button>
          </div>

          {tab === 'login' ? <LoginForm /> : <SignUpForm />}
        </div>
      </div>
    </div>
  )
}
