import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1800&auto=format&fit=crop'

export default function About() {
  const { t } = useTranslation()

  const valueCards = [
    { icon: '✦', title: t('aboutPage.value1Title'), desc: t('aboutPage.value1Desc') },
    { icon: '◈', title: t('aboutPage.value2Title'), desc: t('aboutPage.value2Desc') },
    { icon: '❖', title: t('aboutPage.value3Title'), desc: t('aboutPage.value3Desc') },
  ]

  const statRows = [
    { label: t('aboutPage.statsLocation'), value: t('aboutPage.statsLocationValue') },
    { label: t('aboutPage.statsSpecialization'), value: t('aboutPage.statsSpecializationValue') },
    { label: t('aboutPage.statsProducts'), value: t('aboutPage.statsProductsValue') },
    { label: t('aboutPage.statsStyle'), value: t('aboutPage.statsStyleValue') },
  ]

  return (
    <div className="pb-16 md:pb-24">
      <PageHero
        image={HERO_IMAGE}
        eyebrow={t('aboutPage.label')}
        title={t('aboutPage.title')}
      />

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 md:pt-20">
        <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
          <Reveal className="soft-panel p-7 md:p-10">
            <p className="text-xs uppercase tracking-[0.4em] text-[#b68f61]">{t('aboutPage.brandLabel')}</p>
            <h2 className="mt-4 text-3xl text-[#221d17] md:text-5xl">{t('aboutPage.brandTitle')}</h2>
            <p className="mt-5 text-luxury-muted md:text-lg">{t('aboutPage.p1')}</p>
            <p className="mt-4 text-luxury-muted md:text-lg">{t('aboutPage.p2')}</p>
            <p className="mt-4 text-luxury-muted md:text-lg">{t('aboutPage.p3')}</p>
          </Reveal>

          <Reveal className="soft-panel p-7 md:p-10" delay={120}>
            <div className="space-y-5">
              {statRows.map((row) => (
                <div key={row.label} className="border-l-2 border-[#b68f61] pl-4">
                  <p className="text-[11px] uppercase tracking-[0.26em] text-[#8a7e6f]">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#2a231d] md:text-base">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 md:pt-20">
        <Reveal>
          <div className="mb-9 text-center">
            <p className="text-xs uppercase tracking-[0.44em] text-[#b48b5d]">{t('aboutPage.valuesLabel')}</p>
            <h2 className="mt-4 text-3xl text-[#221d17] md:text-5xl">{t('aboutPage.valuesTitle')}</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {valueCards.map((card, index) => (
            <Reveal key={card.title} delay={index * 80}>
              <article className="soft-panel h-full p-7 text-center transition-transform duration-300 hover:-translate-y-1">
                <span className="text-3xl text-[#b68f61]">{card.icon}</span>
                <h3 className="mt-4 text-xl text-[#2b241e]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-luxury-muted">{card.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 md:pt-20">
        <Reveal>
          <div className="rounded-3xl border border-[#d8cbbd] bg-white/80 px-6 py-12 text-center md:px-12">
            <h2 className="text-3xl text-[#201a14] md:text-5xl">{t('aboutPage.ctaTitle')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-luxury-muted md:text-lg">{t('aboutPage.ctaText')}</p>
            <Link
              to="/contact"
              className="mt-7 inline-flex rounded-full bg-[#b78c59] px-7 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#1e1711] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c89b66]"
            >
              {t('aboutPage.ctaButton')}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
