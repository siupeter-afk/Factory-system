import { createContext, useContext, useState, useCallback } from 'react'
import { en, zh } from './dictionaries'

const LANG_KEY = 'factoryos-lang'
const dicts = { en, zh }

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'en')

  const toggle = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'zh' : 'en'
      localStorage.setItem(LANG_KEY, next)
      return next
    })
  }, [])

  const t = useCallback(
    key => dicts[lang][key] ?? dicts.en[key] ?? key,
    [lang]
  )

  return (
    <I18nContext.Provider value={{ lang, t, toggle }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
