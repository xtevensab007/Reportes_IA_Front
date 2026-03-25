// =============================================
// hooks/useConfigurators.ts
// =============================================

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import configuratorService from '@/services/configuratorService'
import type { Configurator } from '@/types'

export const useConfigurators = () => {
  const [configurators, setConfigurators] = useState<Configurator[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await configuratorService.list()
      setConfigurators(data)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error al cargar configuradores'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const remove = useCallback(async (id: string) => {
    await configuratorService.delete(id)
    setConfigurators((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const add = useCallback((cfg: Configurator) => {
    setConfigurators((prev) => [cfg, ...prev])
  }, [])

  return { configurators, loading, error, refetch: fetch, remove, add }
}
