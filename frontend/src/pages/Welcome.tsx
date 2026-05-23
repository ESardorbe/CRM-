import { useState, useEffect } from 'react'
import { BookOpen, Users, ClipboardCheck, CreditCard, GraduationCap, LogOut, Moon, Sun } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Professional Ta'lim",
    desc: "Tajribali o'qituvchilar bilan sifatli ta'lim olish imkoniyati",
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    icon: BookOpen,
    title: "Ko'plab Yo'nalishlar",
    desc: "Dasturlash, dizayn, ingliz tili va boshqa ko'plab yo'nalishlar mavjud",
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Users,
    title: "Kichik Guruhlar",
    desc: "Har bir o'quvchiga individual yondashuv uchun kichik guruhlar",
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    icon: ClipboardCheck,
    title: "Davomat Nazorati",
    desc: "Darslarni o'tkazib yubormaslik uchun davomat kuzatib boriladi",
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
  {
    icon: CreditCard,
    title: "Qulay To'lov",
    desc: "Naqd pul, karta yoki online orqali to'lov imkoniyati",
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  },
]

export default function Welcome() {
  const { user, logout } = useAuthContext()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Top bar */}
      <header className="bg-white dark:bg-card-dark shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">CRM</span>
            </div>
            <span className="font-bold text-gray-800 dark:text-white text-sm">Ta'lim Markazi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={() => setDark((d) => !d)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={15} /> Chiqish
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
            <GraduationCap size={16} /> Ta'lim markazi
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Xush kelibsiz,{' '}
            <span className="text-primary">{user?.firstName || 'Foydalanuvchi'}!</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base">
            Siz muvaffaqiyatli ro'yxatdan o'tdingiz. Admininstrator sizga tegishli rol tayinlagandan so'ng barcha imkoniyatlarga ega bo'lasiz.
          </p>
          <div className="inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-xl text-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block" />
            Hisobingiz admininstrator tomonidan tekshirilmoqda
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "O'quvchilar", value: '500+', icon: GraduationCap },
            { label: "O'qituvchilar", value: '30+', icon: Users },
            { label: "Guruhlar", value: '50+', icon: BookOpen },
            { label: "Bitiruvchilar", value: '1000+', icon: ClipboardCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-sm text-center">
              <Icon size={24} className="text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Nima taklif qilamiz?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-sm flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact / Info */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white text-center space-y-3">
          <h3 className="text-xl font-bold">Savollaringiz bormi?</h3>
          <p className="text-white/80 text-sm">
            Qo'shimcha ma'lumot uchun administrator bilan bog'laning
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/90">
            <span>📞 +998 90 123 45 67</span>
            <span>📧 info@talim.uz</span>
            <span>📍 Toshkent, O'zbekiston</span>
          </div>
        </div>
      </main>
    </div>
  )
}
