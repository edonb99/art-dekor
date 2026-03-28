import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import { useSiteSettings } from '../hooks/useSiteSettings'

export default function Navbar() {
  const { t } = useTranslation()
  const { user, signOut, isAdmin } = useAuth()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    navigate('/', { replace: true })
    await signOut()
  }

  const linkClass = ({ isActive }) =>
    `text-xs tracking-[0.28em] uppercase transition-colors duration-200 ${
      isActive ? 'text-[#b68e5f] font-semibold' : 'text-[#4f473f] hover:text-[#b68e5f]'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-[#d7cdbf] bg-[#f5f1ec]/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex flex-col leading-tight">
          <span className="text-lg font-semibold tracking-[0.16em] text-[#1f1a16] uppercase">
            {t('brand.name')}
          </span>
          <span className="text-[10px] tracking-[0.4em] text-[#b68e5f] uppercase">
            {t('brand.suffix')}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={linkClass}>{t('nav.home')}</NavLink>
          <NavLink to="/kitchens" className={linkClass}>{t('nav.kitchens')}</NavLink>
          <NavLink to="/furniture" className={linkClass}>{t('nav.furniture')}</NavLink>
          <NavLink to="/others" className={linkClass}>{t('nav.others')}</NavLink>
          <NavLink to="/about" className={linkClass}>{t('nav.about')}</NavLink>
          <NavLink to="/contact" className={linkClass}>{t('nav.contact')}</NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>{t('nav.admin')}</NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {settings.whatsapp_url && (
            <a
              href={settings.whatsapp_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#b68e5f]/60 bg-[#efe6dc] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#3d3228] transition-all hover:-translate-y-0.5 hover:bg-[#e4d5c4]"
            >
              {t('nav.whatsapp')}
            </a>
          )}
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-xs uppercase tracking-[0.24em] text-[#75695d] transition-colors hover:text-[#bd6352]"
            >
              {t('nav.signOut')}
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-[#d5c7b7] px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#50463b] transition-colors hover:bg-white"
            >
              {t('nav.admin')}
            </Link>
          )}
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-full text-[#3e372f] transition-colors hover:bg-[#eae4dc] md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={t('nav.toggleMenu')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#ddd1c2] bg-[#f8f4ef]/95 px-5 py-5 backdrop-blur-md md:hidden">
          <div className="mb-5">
            <LanguageSwitcher compact />
          </div>
          <nav className="flex flex-col gap-1">
          {[
            { to: '/', label: t('nav.home'), end: true },
            { to: '/kitchens', label: t('nav.kitchens') },
            { to: '/furniture', label: t('nav.furniture') },
            { to: '/others', label: t('nav.others') },
            { to: '/about', label: t('nav.about') },
            { to: '/contact', label: t('nav.contact') },
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center rounded-xl px-3 py-3 text-xs font-semibold uppercase tracking-[0.28em] transition-colors ${
                  isActive ? 'bg-[#ece6de] text-[#b68e5f]' : 'text-[#4f473f] hover:bg-[#ece6de]'
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          </nav>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#ddd1c2] pt-5">
          {settings.whatsapp_url && (
            <a
              href={settings.whatsapp_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-[#b68e5f]/50 bg-[#e9ddcd] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#382f27]"
            >
              {t('nav.whatsapp')}
            </a>
          )}

          {user ? (
            <>
              {isAdmin && (
                <NavLink to="/admin" className={linkClass} onClick={() => setMenuOpen(false)}>
                  {t('nav.admin')}
                </NavLink>
              )}
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false) }}
                className="text-xs text-left uppercase tracking-[0.2em] text-[#bd6352]"
              >
                {t('nav.signOut')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-xs uppercase tracking-[0.22em] text-[#4b443d]"
              onClick={() => setMenuOpen(false)}
            >
              {t('nav.adminLogin')}
            </Link>
          )}
          </div>
        </div>
      )}
    </header>
  )
}
