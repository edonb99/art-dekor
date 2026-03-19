import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import GalleryGrid from '../components/GalleryGrid'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { fetchGalleryItems } from '../lib/siteContent'
import kitchenHeroImage from '../assets/kitchen_pic.jpg'

const HERO_IMAGE = kitchenHeroImage

export default function Kitchens() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function fetchKitchens() {
      try {
        const data = await fetchGalleryItems({ category: 'kitchens', activeOnly: true })
        if (!ignore) setItems(data)
      } catch {
        if (!ignore) setItems([])
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchKitchens()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="pb-16 md:pb-24">
      <PageHero
        image={HERO_IMAGE}
        eyebrow={t('gallery.label')}
        title={t('kitchensPage.title')}
        subtitle={t('kitchensPage.subtitle')}
      />

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 md:pt-16">
        <Reveal>
          <GalleryGrid
            items={items}
            loading={loading}
          />
        </Reveal>
      </section>
    </div>
  )
}
