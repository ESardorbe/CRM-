import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthContext } from '../context/AuthContext'

type Step = 'register' | 'verify'

export default function Register() {
  const { user, isLoading } = useAuthContext()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('register')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, isLoading, navigate])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsPending(true)
    try {
      await authApi.register({ firstName, lastName: lastName || undefined, email, password })
      setStep('verify')
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Xatolik yuz berdi'))
    } finally {
      setIsPending(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsPending(true)
    try {
      await authApi.verifyEmail(email, verifyCode)
      navigate('/login', { replace: true, state: { verified: true } })
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

        {step === 'register' ? (
          <>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Ro'yxatdan o'tish</h1>
            <p className="text-sm text-gray-400 mb-6">Ma'lumotlaringizni kiriting</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Ism *</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Ism"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Familiya</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Familiya"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Email *</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Parol *</label>
                <div className="relative">
                  <input
                    className="input-field pr-10"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
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
                    Yuborilmoqda...
                  </>
                ) : (
                  "Ro'yxatdan o'tish"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Hisobingiz bormi?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Kirish
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Email tasdiqlash</h1>
            <p className="text-sm text-gray-400 mb-1">
              <span className="font-medium text-gray-600 dark:text-gray-300">{email}</span> manziliga
              tasdiqlash kodi yuborildi
            </p>
            <p className="text-xs text-gray-400 mb-6">Kod 5 daqiqa davomida amal qiladi</p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Tasdiqlash kodi</label>
                <input
                  className="input-field text-center text-xl tracking-widest font-mono"
                  type="text"
                  placeholder="a1b2c3"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.trim())}
                  required
                  autoFocus
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Tasdiqlanmoqda...
                  </>
                ) : (
                  'Tasdiqlash'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep('register'); setError('') }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Orqaga qaytish
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
