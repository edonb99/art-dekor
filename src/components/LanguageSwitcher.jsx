import { useTranslation } from 'react-i18next'
import britishFlag from '../assets/British.png'
import albanianFlag from '../assets/Flag_of_Albania.svg.webp'
import germanFlag from '../assets/Flag_of_Germany.svg.png'

const LANGS = [
  { code: 'sq', flagSrc: albanianFlag },
  { code: 'en', flagSrc: britishFlag },
  { code: 'de', flagSrc: germanFlag },
]

export default function LanguageSwitcher({ compact = false }) {
  const { i18n, t } = useTranslation()

  return (
    <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-1.5'}`}>
      <span className="sr-only">{t('nav.language')}</span>
      {LANGS.map(({ code, flagSrc }) => {
        const active = i18n.resolvedLanguage === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => i18n.changeLanguage(code)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer active:scale-95 ${
              active
                ? 'border-[#d1a46d] bg-[#d1a46d] text-[#1a1310]'
                : 'border-[#d9d3cc] text-[#5f584f] hover:border-[#b79f83] hover:text-[#2f2a24]'
            }`}
            aria-label={t(`languages.${code}`)}
          >
            <img
              src={flagSrc}
              alt={t(`languages.${code}`)}
              className="h-3.5 w-5 rounded-xs object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
              loading="lazy"
            />
            <span>{code}</span>
          </button>
        )
      })}
    </div>
  )
}
