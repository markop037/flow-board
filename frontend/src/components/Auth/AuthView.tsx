import { useState } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { cn } from '../../lib/utils'

type Tab = 'login' | 'signup'

export function AuthView() {
  const [tab, setTab] = useState<Tab>('login')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-100 px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/25">
            <LayoutDashboard size={28} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-stone-800">Flow Board</h1>
          <p className="text-sm text-stone-500">Sign in or create an account</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50">
          <div className="mb-6 flex rounded-xl bg-stone-100 p-1.5">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-150',
                tab === 'login'
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-600 hover:text-stone-800',
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-150',
                tab === 'signup'
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-600 hover:text-stone-800',
              )}
            >
              Sign up
            </button>
          </div>

          {tab === 'login' ? <LoginForm /> : <SignUpForm />}

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <span className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-center text-xs text-stone-500">
                &copy; {new Date().getFullYear()} Flow Board
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
