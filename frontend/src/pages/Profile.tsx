import { useState, useEffect, useRef } from 'react'
import { Check, Camera } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import ImageCropModal from '../components/ui/ImageCropModal'

export default function Profile() {
  const { user, updateProfile } = useAuthContext()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    avatarUrl: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? '',
        avatarUrl: user.avatarUrl ?? '',
      })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsSaving(true)
    try {
      await updateProfile({
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
        avatarUrl: form.avatarUrl || undefined,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Saqlashda xatolik yuz berdi'))
    } finally {
      setIsSaving(false)
    }
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const avatarLetter = (form.firstName || user?.firstName || 'U')[0]?.toUpperCase()

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors shadow-md"
            >
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800 dark:text-white text-lg">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className="mt-1 inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {user?.role}
            </span>
          </div>
        </div>

        <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
          Ma'lumotlarni tahrirlash
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Ism</label>
              <input className="input-field" placeholder="Ism" value={form.firstName} onChange={set('firstName')} />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Familiya</label>
              <input className="input-field" placeholder="Familiya" value={form.lastName} onChange={set('lastName')} />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Telefon</label>
            <input className="input-field" placeholder="+998 XX XXX XX XX" value={form.phone} onChange={set('phone')} />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 flex items-center gap-2">
              <Check size={14} className="text-green-600 dark:text-green-400" />
              <p className="text-green-600 dark:text-green-400 text-sm">Muvaffaqiyatli saqlandi!</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Saqlash'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-1">
          <p className="text-xs text-gray-400">
            Email: <span className="text-gray-600 dark:text-gray-300">{user?.email}</span>
          </p>
          <p className="text-xs text-gray-400">
            Rol: <span className="text-gray-600 dark:text-gray-300">{user?.role}</span>
          </p>
          {user?.isVerify !== undefined && (
            <p className="text-xs text-gray-400">
              Tasdiqlangan:{' '}
              <span className={user.isVerify ? 'text-green-600' : 'text-red-500'}>
                {user.isVerify ? 'Ha' : "Yo'q"}
              </span>
            </p>
          )}
        </div>
      </div>

      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          onCrop={handleCropDone}
          onClose={() => setCropSrc(null)}
        />
      )}
    </div>
  )
}
