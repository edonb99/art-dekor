import { useAuth } from '../hooks/useAuth'
import { useTranslation } from 'react-i18next'

export default function AdminBanner() {
  const { t } = useTranslation()
  const { isAdmin, user } = useAuth()

  if (!isAdmin) {
    return null
  }

  return (
    <div className="w-full border-b border-[#d7c4aa] bg-[#f2e4d2] text-[#6f5332]">
      <div className="mx-auto max-w-7xl px-4 py-2 text-xs font-medium tracking-[0.08em] sm:px-6 sm:text-sm">
        {t('adminBanner.loggedInAs', { email: user?.email })}
      </div>
    </div>
  )
}
