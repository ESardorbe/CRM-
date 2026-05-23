import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useLang } from '../../context/LangContext'
import type { TKey } from '../../i18n/translations'

const pageTitleKeys: Record<string, TKey> = {
  '/dashboard': 'pageReport',
  '/students': 'pageStudents',
  '/directions': 'pageDirections',
  '/groups': 'pageGroups',
  '/payments': 'pagePayments',
  '/attendance': 'pageAttendance',
  '/requests': 'pageRequests',
  '/teachers': 'pageTeachers',
  '/users': 'pageUsers',
  '/profile': 'pageProfile',
}

export default function Layout() {
  const { pathname } = useLocation()
  const { t } = useLang()
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const titleKey = pageTitleKeys[pathname]
  const title = titleKey ? t(titleKey) : 'CRM Panel'

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} dark={dark} onToggleDark={() => setDark((d) => !d)} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
