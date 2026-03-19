import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import GalleryGrid from '../components/GalleryGrid'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { fetchGalleryItems } from '../lib/siteContent'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1800&auto=format&fit=crop'

export default function Others() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function fetchOthers() {
      try {
        const data = await fetchGalleryItems({ category: 'others', activeOnly: true })
        if (!ignore) setItems(data)
      } catch {
        if (!ignore) setItems([])
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchOthers()
    return () => { ignore = true }
  }, [])

  return (
    <div className="pb-16 md:pb-24">
      <PageHero
        image={HERO_IMAGE}
        eyebrow={t('gallery.label')}
        title={t('othersPage.title')}
        subtitle={t('othersPage.subtitle')}
      />

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 md:pt-16">
        <Reveal>
          <GalleryGrid items={items} loading={loading} />
        </Reveal>
      </section>
    </div>
  )
}
