import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { t } = useTranslation()
  const { user, signIn, loading, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  if (!loading && user && !isAdmin) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signIn(email.trim(), password)
      navigate('/admin')
    } catch (err) {
      setError(err?.message || t('login.invalid'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1c1815] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(182,143,97,0.35),transparent_40%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.14),transparent_42%)]" />
      <div className="glass-surface relative z-10 w-full max-w-md rounded-3xl p-8 md:p-10">
        <div className="text-center">
          <h1 className="text-3xl text-[#1f1a15] md:text-4xl">{t('login.title')}</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.28em] text-[#7b6f62]">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.24em] text-[#6e6256]" htmlFor="email">
              {t('login.email')}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-[#d4c6b7] bg-white/80 px-4 py-3 text-[#2e2720] focus-ring"
              placeholder={t('contactPage.emailPlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.24em] text-[#6e6256]" htmlFor="password">
              {t('login.password')}
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-[#d4c6b7] bg-white/80 px-4 py-3 text-[#2e2720] focus-ring"
              placeholder={t('login.passwordPlaceholder')}
            />
          </div>

          {error && <p className="text-sm text-[#b65252]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#b78b58] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#1b140f] transition-colors hover:bg-[#c79a66] disabled:cursor-not-allowed disabled:bg-[#d8c6af]"
          >
            {submitting ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>
      </div>
    </div>
  )
}
