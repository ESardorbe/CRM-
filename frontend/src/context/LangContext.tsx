import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, type Lang, type TKey } from '../i18n/translations'

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TKey) => string
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('lang')
    return stored === 'ru' ? 'ru' : 'uz'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  const t = (key: TKey): string => translations[lang][key] as string

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
