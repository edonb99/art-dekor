import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function GalleryGrid({
  items,
  loading,
  filters = [],
  defaultFilter = 'all',
  lightbox = true,
}) {
  const { t } = useTranslation()
  const [activeFilter, setActiveFilter] = useState(defaultFilter)
  const [previewIndex, setPreviewIndex] = useState(null)
  const touchStartX = useRef(null)

  const filteredItems = useMemo(() => {
    if (!items) return []
    if (activeFilter === 'all') return items
    return items.filter((item) => item.section === activeFilter || item.category === activeFilter)
  }, [activeFilter, items])

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (previewIndex === null) return
    const len = filteredItems.length
    function onKey(e) {
      if (e.key === 'ArrowRight') setPreviewIndex((i) => (i + 1) % len)
      if (e.key === 'ArrowLeft') setPreviewIndex((i) => (i - 1 + len) % len)
      if (e.key === 'Escape') setPreviewIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewIndex, filteredItems.length])

  function onLbTouchStart(e) { touchStartX.current = e.changedTouches[0]?.clientX ?? null }
  function onLbTouchEnd(e) {
    if (touchStartX.current == null) return
    const delta = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current
    if (Math.abs(delta) > 48) {
      const len = filteredItems.length
      if (delta < 0) setPreviewIndex((i) => (i + 1) % len)
      else setPreviewIndex((i) => (i - 1 + len) % len)
    }
    touchStartX.current = null
  }

  if (loading) {
    return (
      <div className="columns-2 gap-1.5 lg:columns-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`mb-1.5 break-inside-avoid animate-pulse rounded-xl bg-[#e9e3dc] ${
              i % 3 === 0 ? 'h-72' : i % 2 === 0 ? 'h-48' : 'h-60'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      {!!filters.length && (
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition-all duration-300 ${
                activeFilter === filter.value
                  ? 'border-[#b68f61] bg-[#b68f61] text-[#181411]'
                  : 'border-[#d9d1c8] text-[#6b6155] hover:border-[#c0a07a] hover:text-[#2f2821]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {!filteredItems.length ? (
        <div className="rounded-3xl border border-[#dfd6cc] bg-white/80 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-[#2f2a24]">{t('gallery.emptyTitle')}</p>
          <p className="mt-2 text-sm text-[#7c7368]">{t('gallery.emptyText')}</p>
        </div>
      ) : (
        /* ── Masonry / Puzzle grid ── */
        <div className="columns-2 gap-1.5 lg:columns-3">
          {filteredItems.map((item, idx) => (
            <article
              key={item.id}
              className="group mb-1.5 break-inside-avoid overflow-hidden rounded-xl"
              style={{
                animation: `fadeUp 0.5s ${Math.min(idx * 45, 360)}ms ease-out both`,
              }}
            >
              <button
                type="button"
                onClick={() => lightbox && setPreviewIndex(idx)}
                className="relative block w-full overflow-hidden"
                aria-label="View photo"
              >
                <img
                  src={item.image_url}
                  alt={item.alt_text || ''}
                  className="block w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  loading="lazy"
                />
                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-[#201912]/0 transition-all duration-500 group-hover:bg-[#201912]/18">
                  <span className="flex h-10 w-10 scale-75 items-center justify-center rounded-full border border-white/60 bg-white/10 text-white opacity-0 backdrop-blur-sm transition-all duration-400 group-hover:scale-100 group-hover:opacity-100">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0Z" />
                    </svg>
                  </span>
                </div>
              </button>
            </article>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && previewIndex !== null && (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-[#16120f]/82 backdrop-blur-sm"
          onClick={() => setPreviewIndex(null)}
          onTouchStart={onLbTouchStart}
          onTouchEnd={onLbTouchEnd}
        >
          <div
            className="relative flex h-full w-full items-center justify-center p-4 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setPreviewIndex(null)}
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
              aria-label={t('common.close')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Prev */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={() => setPreviewIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length)}
                className="absolute left-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 md:left-6"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Image with fade-in animation */}
            <img
              key={previewIndex}
              src={filteredItems[previewIndex]?.image_url}
              alt={filteredItems[previewIndex]?.alt_text || ''}
              className="max-h-[88vh] max-w-[88vw] rounded-2xl object-contain shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
              style={{ animation: 'scaleIn 0.28s ease-out' }}
            />

            {/* Next */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={() => setPreviewIndex((i) => (i + 1) % filteredItems.length)}
                className="absolute right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 md:right-6"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Counter */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tabular-nums tracking-[0.18em] text-white/75 backdrop-blur-sm">
              {previewIndex + 1} / {filteredItems.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
