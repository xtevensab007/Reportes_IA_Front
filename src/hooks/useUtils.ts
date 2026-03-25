// =============================================
// hooks/useUtils.ts — Hooks utilitarios
// =============================================

import { useState, useEffect, useRef, useCallback } from 'react'

// ---- useDebounce ----
export const useDebounce = <T>(value: T, delay = 400): T => {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ---- useLocalStorage ----
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const next = value instanceof Function ? value(stored) : value
        setStored(next)
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        console.warn(`useLocalStorage: could not save key "${key}"`)
      }
    },
    [key, stored]
  )

  const remove = useCallback(() => {
    localStorage.removeItem(key)
    setStored(initialValue)
  }, [key, initialValue])

  return [stored, setValue, remove] as const
}

// ---- useInterval ---- (para polling de estado de reporte)
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCb = useRef(callback)
  useEffect(() => { savedCb.current = callback }, [callback])
  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCb.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

// ---- usePageTitle ----
export const usePageTitle = (title: string) => {
  useEffect(() => {
    const prev = document.title
    document.title = `${title} — ReportAI`
    return () => { document.title = prev }
  }, [title])
}

// ---- useClickOutside ----
export const useClickOutside = <T extends HTMLElement>(callback: () => void) => {
  const ref = useRef<T>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) callback()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [callback])
  return ref
}
