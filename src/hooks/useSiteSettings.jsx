import { useEffect, useState } from 'react'
import { DEFAULT_SITE_SETTINGS, fetchSiteSettings } from '../lib/siteContent'

export function useSiteSettings() {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadSettings() {
      try {
        const data = await fetchSiteSettings()
        if (!ignore) setSettings(data)
      } catch {
        if (!ignore) setSettings(DEFAULT_SITE_SETTINGS)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadSettings()
    return () => {
      ignore = true
    }
  }, [])

  return { settings, loading, setSettings }
}
