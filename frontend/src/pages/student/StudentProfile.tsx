import { useState, useEffect, useRef } from 'react'
import { Check, Camera, KeyRound, Eye, EyeOff, Mail, ArrowRight } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { authApi } from '../../api/auth'
import ImageCropModal from '../../components/ui/ImageCropModal'

export default function StudentProfile() {
  const { user, updateProfile } = useAuthContext()
  const { t } = useLang()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', avatarUrl: '' })
  const [saving, setSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  // Password flow
  const [pwStep, setPwStep] = useState<1 | 2>(1)
  const [pwEmail, setPwEmail] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? '+998',
        avatarUrl: user.avatarUrl ?? '',
      })
      setPwEmail(user.email ?? '')
    }
  }, [user])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCropSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropDone = (base64: string) => {
    setForm((f) => ({ ...f, avatarUrl: base64 }))
    setCropSrc(null)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setSaving(true)
    try {
      await updateProfile({
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
        avatarUrl: form.avatarUrl || undefined,
      })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setProfileError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Xatolik yuz berdi'))
    } finally {
      setSaving(false)
    }
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSaving(true)
    try {
      await authApi.resetPassword(pwEmail)
      setPwStep(2)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setPwError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Xatolik yuz berdi'))
    } finally {
      setPwSaving(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (newPassword !== confirmPassword) { setPwError(t('passwordMismatch')); return }
    setPwSaving(true)
    try {
      await authApi.updatePassword({ email: pwEmail, verifyCode, newPassword })
      setPwSuccess(true)
      setPwStep(1)
      setVerifyCode(''); setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setPwSuccess(false), 4000)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setPwError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Xatolik yuz berdi'))
    } finally {
      setPwSaving(false)
    }
  }

  const avatarLetter = (form.firstName || user?.firstName || 'S')[0]?.toUpperCase()

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Profile card */}
      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-800 dark:text-white mb-5">{t('myProfile')}</h2>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
              {form.avatarUrl
                ? <img src={form.avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                : <span>{avatarLetter}</span>
              }
            </div>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md">
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('name')}</label>
              <input className="input-field" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('lastName')}</label>
              <input className="input-field" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('phone')}</label>
            <input className="input-field" placeholder="+998 XX XXX XX XX" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>

          {profileError && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{profileError}</p>}
          {profileSuccess && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg text-sm">
              <Check size={14} /> Muvaffaqiyatli saqlandi!
            </div>
          )}

          <button type="submit" disabled={saving} className="w-full btn-primary flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('save')}
          </button>
        </form>
      </div>

      {/* Change password card */}
      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={18} className="text-primary" />
          <h2 className="text-base font-bold text-gray-800 dark:text-white">{t('changePassword')}</h2>
        </div>

        <div className="flex items-center gap-2 mb-5 mt-3">
          {[1, 2].map((s) => (
            <div key={s} className={`flex items-center gap-1.5 text-xs font-medium ${pwStep >= s ? 'text-primary' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${pwStep >= s ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>{s}</span>
              {s === 1 ? 'Email orqali kod' : 'Yangi parol'}
              {s === 1 && <ArrowRight size={12} className="text-gray-300 ml-1" />}
            </div>
          ))}
        </div>

        {pwSuccess && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg text-sm mb-4">
            <Check size={14} /> {t('passwordChanged')}
          </div>
        )}

        {pwStep === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
              <Mail size={14} className="text-gray-400 shrink-0" /> {pwEmail}
            </div>
            {pwError && <p className="text-red-500 text-sm">{pwError}</p>}
            <button type="submit" disabled={pwSaving} className="w-full btn-primary flex items-center justify-center gap-2">
              {pwSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Mail size={15} /> Email orqali kod yuborish</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Tasdiqlash kodi</label>
              <input className="input-field" placeholder="Email dan kelgan kod" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} required />
            </div>
            <div className="relative">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('newPassword')}</label>
              <input className="input-field pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-[2.15rem] text-gray-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('confirmPassword')}</label>
              <input className="input-field" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            {pwError && <p className="text-red-500 text-sm">{pwError}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setPwStep(1); setPwError('') }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {t('cancel')}
              </button>
              <button type="submit" disabled={pwSaving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {pwSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('save')}
              </button>
            </div>
          </form>
        )}
      </div>

      {cropSrc && (
        <ImageCropModal src={cropSrc} onCrop={handleCropDone} onClose={() => setCropSrc(null)} />
      )}
    </div>
  )
}
