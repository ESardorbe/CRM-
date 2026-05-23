import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'

export default function Login() {
  const { login, user, isLoading } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  const verified = (location.state as any)?.verified

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, isLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsPending(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Xatolik yuz berdi'))
    } finally {
      setIsPending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-lg p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">CRM</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-gray-800 dark:text-white">CRM Panel</p>
            <p className="text-xs text-gray-400">Boshqaruv tizimi</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Tizimga kirish</h1>
        <p className="text-sm text-gray-400 mb-6">Email va parolingizni kiriting</p>

        {verified && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 mb-4">
            <p className="text-green-600 dark:text-green-400 text-sm">Email tasdiqlandi! Tizimga kiring.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Parol</label>
            <div className="relative">
              <input
                className="input-field pr-10"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Kirilmoqda...
              </>
            ) : (
              'Kirish'
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
          <span className="text-xs text-gray-400">yoki</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
        </div>

        <a
          href="/api/auth/google"
          className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-600 rounded-xl py-2.5 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M43.6 24.5c0-1.5-.1-3-.4-4.5H24v8.5h11c-.5 2.5-1.9 4.6-4 6v5h6.4c3.8-3.5 6.2-8.7 6.2-15z" fill="#4285F4"/>
            <path d="M24 44c5.4 0 10-1.8 13.3-4.9l-6.4-5c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H6v5.2C9.3 39.5 16.2 44 24 44z" fill="#34A853"/>
            <path d="M12.6 27.7c-.4-1.2-.6-2.4-.6-3.7s.2-2.5.6-3.7V15H6A20 20 0 0 0 4 24c0 3.2.8 6.3 2 9l6.6-5.3z" fill="#FBBC05"/>
            <path d="M24 9.5c3 0 5.6 1 7.7 3l5.7-5.7C33.9 3.5 29.3 1.5 24 1.5 16.2 1.5 9.3 6 6 13.1l6.6 5.2C14.2 13.1 18.7 9.5 24 9.5z" fill="#EA4335"/>
          </svg>
          Google bilan kirish
        </a>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </div>
    </div>
  )
}
