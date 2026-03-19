import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSiteSettings } from '../hooks/useSiteSettings'

export default function Footer() {
  const { t } = useTranslation()
  const { settings } = useSiteSettings()

  const socials = [
    { key: 'facebook', href: settings.facebook_url },
    { key: 'instagram', href: settings.instagram_url },
    { key: 'tiktok', href: settings.tiktok_url },
    { key: 'whatsapp', href: settings.whatsapp_url },
  ].filter((item) => item.href)

  return (
    <footer className="mt-auto border-t border-[#d8cec1] bg-[#191613] text-[#dfd3c3]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-lg font-semibold uppercase tracking-[0.16em] text-white">
              {t('brand.name')} {t('brand.suffix')}
            </h3>
            <p className="text-sm leading-relaxed text-[#baad9b]">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-white">
              {t('footer.explore')}
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/kitchens', label: t('nav.kitchens') },
                { to: '/furniture', label: t('nav.furniture') },
                { to: '/others', label: t('nav.others') },
                { to: '/about', label: t('nav.about') },
                { to: '/contact', label: t('nav.contact') },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-[#d2c4b2] transition-colors hover:text-[#d7b185]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-white">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-2 text-sm text-[#cab9a5]">
              <li>{settings.address || '-'}</li>
              <li>
                <a href={`tel:${settings.phone || ''}`} className="transition-colors hover:text-[#d7b185]">
                  {settings.phone || '-'}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.email || ''}`} className="transition-colors hover:text-[#d7b185]">
                  {settings.email || '-'}
                </a>
              </li>
              {!!socials.length && (
                <li className="pt-2">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#8d7d6a]">{t('footer.social')}</p>
                  <div className="flex flex-wrap gap-2">
                    {socials.map((social) => (
                      <a
                        key={social.key}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[#4a4035] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#d8ccb9] transition-colors hover:border-[#b58f61] hover:text-[#f0e3d1]"
                      >
                        {t(`social.${social.key}`)}
                      </a>
                    ))}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#3d352d] pt-6 text-center text-xs text-[#8d7d6a]">
          © {new Date().getFullYear()} {t('brand.name')} {t('brand.suffix')}. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
