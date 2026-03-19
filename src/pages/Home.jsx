import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HeroSlideshow from '../components/HeroSlideshow'
import Reveal from '../components/Reveal'
import { fetchGalleryItems } from '../lib/siteContent'

const COLLECTION_CARDS = [
  { key: 'kitchens', to: '/kitchens' },
  { key: 'furniture', to: '/furniture' },
  { key: 'others', to: '/others' },
]

export default function Home() {
  const { t } = useTranslation()
  const [slides, setSlides] = useState([])

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        // Slideshow shows all active gallery images (kitchens + furniture + others)
        const data = await fetchGalleryItems({ activeOnly: true })
        if (!ignore) setSlides(data)
      } catch {
        if (!ignore) setSlides([])
      }
    }

    load()
    return () => { ignore = true }
  }, [])

  const fallbackSlides = useMemo(
    () => [
      {
        id: 'fallback-slide-1',
        image_url:
          'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=1800&auto=format&fit=crop',
        is_active: true,
      },
    ],
    []
  )

  return (
    <div className="space-y-16 pb-16 md:space-y-24 md:pb-24">
      <HeroSlideshow slides={slides.length ? slides : fallbackSlides} />

      <section className="mx-auto -mt-8 max-w-6xl px-4 sm:px-6 md:-mt-14">
        <Reveal from="scale" className="soft-panel p-6 sm:p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.44em] text-[#b48b5d]">{t('home.storyLabel')}</p>
          <h2 className="mt-4 max-w-3xl text-3xl text-[#211b15] md:text-5xl">
            {t('home.storyTitle')}
          </h2>
          <p className="mt-5 max-w-3xl text-luxury-muted md:text-lg">{t('home.storyText')}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/kitchens"
              className="group relative inline-flex items-center overflow-hidden rounded-full bg-[#b78b58] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#1e1812] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c69a66]"
            >
              <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.55),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">{t('home.exploreKitchens')}</span>
            </Link>
            <Link
              to="/furniture"
              className="inline-flex items-center rounded-full border border-[#c4b4a2] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#42382f] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ab8b67]"
            >
              {t('home.exploreFurniture')}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal from="fade">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.44em] text-[#b48b5d]">{t('home.collectionsLabel')}</p>
            <h2 className="mt-4 text-3xl text-[#211b15] md:text-5xl">{t('home.collectionsTitle')}</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {COLLECTION_CARDS.map((card, index) => (
            <Reveal key={card.key} delay={index * 100} from="scale">
              <Link
                to={card.to}
                className="group soft-panel flex flex-col items-center justify-center gap-4 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(24,20,16,0.11)]"
              >
                <span className="text-3xl font-semibold text-[#ac8356]">{String(index + 1).padStart(2, '0')}</span>
                <p className="text-base font-semibold uppercase tracking-[0.2em] text-[#2b241e]">
                  {t(`collections.${card.key}`)}
                </p>
                <span className="text-xs uppercase tracking-[0.22em] text-[#b48b5d] transition-colors group-hover:text-[#8f6d43]">
                  {t('common.viewAll')} →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal from="bottom">
          <div className="overflow-hidden rounded-3xl bg-[linear-gradient(125deg,#201b16,#3a2e22_45%,#b38959_130%)] px-6 py-14 text-center text-white md:px-12">
            <h2 className="text-3xl md:text-5xl">{t('home.ctaTitle')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#e9dccc] md:text-lg">{t('home.ctaText')}</p>
            <Link
              to="/contact"
              className="mt-8 inline-flex rounded-full border border-[#ddc2a3] bg-[#e2c39d] px-7 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#1f1811] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ebcfad]"
            >
              {t('home.ctaButton')}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

