import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { useSiteSettings } from '../hooks/useSiteSettings'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&auto=format&fit=crop'

export default function Contact() {
  const { t } = useTranslation()
  const { settings } = useSiteSettings()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')

    const { error: dbError } = await supabase.from('contact_messages').insert([form])

    if (dbError) {
      setError(t('contactPage.error'))
      setStatus('error')
      return
    }

    setStatus('success')
    setForm({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <div className="pb-16 md:pb-24">
      <PageHero
        image={HERO_IMAGE}
        eyebrow={t('contactPage.label')}
        title={t('contactPage.title')}
      />

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 md:pt-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          <Reveal className="soft-panel p-7 md:p-10">
            <p className="text-xs uppercase tracking-[0.4em] text-[#b68f61]">{t('contactPage.detailsLabel')}</p>
            <h2 className="mt-4 text-3xl text-[#221d17] md:text-5xl">{t('contactPage.detailsTitle')}</h2>
            <p className="mt-5 text-luxury-muted md:text-lg">{t('contactPage.detailsText')}</p>

            <ul className="mt-8 space-y-5">
              <li className="rounded-2xl border border-[#e1d7cd] bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8b7f71]">{t('contactPage.address')}</p>
                <p className="mt-1 text-[#2f2922]">{settings.address || '-'}</p>
              </li>
              <li className="rounded-2xl border border-[#e1d7cd] bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8b7f71]">{t('contactPage.phone')}</p>
                <a href={`tel:${settings.phone || ''}`} className="mt-1 block text-[#2f2922] hover:text-[#b48b5d]">
                  {settings.phone || '-'}
                </a>
              </li>
              <li className="rounded-2xl border border-[#e1d7cd] bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8b7f71]">{t('contactPage.email')}</p>
                <a href={`mailto:${settings.email || ''}`} className="mt-1 block text-[#2f2922] hover:text-[#b48b5d]">
                  {settings.email || '-'}
                </a>
              </li>
            </ul>

            {settings.map_url && (
              <a
                href={settings.map_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex rounded-full border border-[#ceb79b] px-5 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#43382d] transition-colors hover:bg-white"
              >
                {t('contactPage.map')}
              </a>
            )}
          </Reveal>

          <Reveal className="soft-panel p-7 md:p-10" delay={100}>
            {status === 'success' ? (
              <div className="py-20 text-center">
                <h3 className="text-2xl text-[#241f18]">{t('contactPage.successTitle')}</h3>
                <p className="mt-2 text-luxury-muted">{t('contactPage.successText')}</p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-6 rounded-full border border-[#d0c1af] px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#493e34]"
                >
                  {t('contactPage.sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Field
                  id="name"
                  label={t('contactPage.formName')}
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t('contactPage.namePlaceholder')}
                  required
                />
                <Field
                  id="email"
                  type="email"
                  label={t('contactPage.formEmail')}
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t('contactPage.emailPlaceholder')}
                  required
                />
                <Field
                  id="phone"
                  type="tel"
                  label={t('contactPage.formPhone')}
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={t('contactPage.phonePlaceholder')}
                />

                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.25em] text-[#766a5d]" htmlFor="message">
                    {t('contactPage.formMessage')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t('contactPage.messagePlaceholder')}
                    className="w-full rounded-2xl border border-[#d9cec0] bg-white/80 px-4 py-3 text-[#2f2a24] placeholder:text-[#9b8f82] focus-ring"
                  />
                </div>

                {error && <p className="text-sm text-[#b65252]">{error}</p>}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-full bg-[#b78b58] px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#1b140f] transition-colors hover:bg-[#c79a66] disabled:cursor-not-allowed disabled:bg-[#d8c6af]"
                >
                  {status === 'loading' ? t('contactPage.sending') : t('contactPage.send')}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function Field({ id, label, value, onChange, placeholder, required = false, type = 'text' }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.25em] text-[#766a5d]" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#d9cec0] bg-white/80 px-4 py-3 text-[#2f2a24] placeholder:text-[#9b8f82] focus-ring"
      />
    </div>
  )
}
