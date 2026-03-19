import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const INTERVAL = 5500

function resolveHref(link) {
  if (!link) return '/contact'
  if (link.startsWith('http://') || link.startsWith('https://')) return link
  return link.startsWith('/') ? link : `/${link}`
}

export default function HeroSlideshow({ slides }) {
  const { t } = useTranslation()
  const activeSlides = useMemo(
    () => (slides || []).filter((s) => s.is_active !== false),
    [slides]
  )
  const [index, setIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const resumeTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % activeSlides.length)
    }, INTERVAL)
    return () => clearInterval(timer)
  }, [activeSlides.length, isPaused])

  const safeIndex = activeSlides.length ? index % activeSlides.length : 0
  const current = activeSlides[safeIndex] ?? null

  function pauseAutoplay() {
    setIsPaused(true)
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
    }
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false)
      resumeTimerRef.current = null
    }, INTERVAL)
  }

  function goNext(userInitiated = false) {
    if (activeSlides.length <= 1) return
    if (userInitiated) pauseAutoplay()
    setIndex((p) => (p + 1) % activeSlides.length)
  }

  function goPrev(userInitiated = false) {
    if (activeSlides.length <= 1) return
    if (userInitiated) pauseAutoplay()
    setIndex((p) => (p - 1 + activeSlides.length) % activeSlides.length)
  }

  function onTouchStart(e) { setTouchStartX(e.changedTouches[0]?.clientX ?? null) }
  function onTouchEnd(e) {
    if (touchStartX == null) return
    const delta = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX
    if (Math.abs(delta) > 40) { if (delta > 0) goPrev(true); else goNext(true) }
    setTouchStartX(null)
  }

  if (!current) {
    return (
      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1e1a16]"
        style={{ minHeight: '100svh' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,232,191,0.14),transparent_45%),radial-gradient(circle_at_80%_40%,rgba(173,142,108,0.18),transparent_42%)]" />
        <div className="relative px-6 text-center text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.55em] text-[#d8b98e]">{t('home.showcaseLabel')}</p>
          <h1 className="mt-4 text-4xl font-semibold md:text-6xl">{t('home.fallbackSlideTitle')}</h1>
        </div>
      </section>
    )
  }

  return (
    <section
      className="group relative min-h-screen overflow-hidden"
      style={{ minHeight: '100svh' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Slide backgrounds ── */}
      {activeSlides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === safeIndex ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={i !== safeIndex}
        >
          {/* Ken Burns wrapper — re-keyed to restart animation on each reveal */}
          <div
            className="h-full w-full"
            style={i === safeIndex ? { animation: 'kenBurns 9s ease-out forwards' } : undefined}
          >
            <img
              src={slide.image_url}
              alt={slide.alt_text || t('slideshow.altFallback')}
              className="h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
          {/* Two-layer gradient: dark top for UI, dark bottom for text */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,7,6,0.5)_0%,rgba(8,7,6,0.0)_35%,rgba(8,7,6,0.0)_55%,rgba(8,7,6,0.75)_100%)]" />
        </div>
      ))}

      {/* ── Text content ── */}
      <div
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-end px-5 pb-24 pt-28 sm:px-8 md:justify-center md:pb-24"
        style={{ minHeight: '100svh' }}
      >
        <div className="max-w-2xl text-white">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.55em] text-[#d3b18a]"
            style={{ animation: 'fadeUp 0.6s ease-out both' }}
          >
            {t('home.showcaseLabel')}
          </p>

          {current.title && (
            <h1
              className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ animation: 'fadeUp 0.65s 0.08s ease-out both' }}
            >
              {current.title}
            </h1>
          )}

          {current.subtitle && (
            <p
              className="mt-4 max-w-lg text-sm leading-relaxed text-[#e8ddd0]/90 sm:text-base"
              style={{ animation: 'fadeUp 0.65s 0.16s ease-out both' }}
            >
              {current.subtitle}
            </p>
          )}

          {current.button_link && (
            <div style={{ animation: 'fadeUp 0.65s 0.24s ease-out both' }} className="mt-7">
              <Link
                to={resolveHref(current.button_link)}
                className="group/btn relative inline-flex items-center overflow-hidden rounded-full bg-[#d3b18a] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#1e1914] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
              >
                <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.65),transparent)] transition-transform duration-700 group-hover/btn:translate-x-full" />
                <span className="relative">{current.button_text || t('slideshow.defaultButton')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Slide counter (top right) ── */}
      {activeSlides.length > 1 && (
        <div className="absolute right-5 top-5 z-20 flex items-baseline gap-1 text-white/70 sm:right-7 sm:top-6">
          <span className="text-base font-semibold tabular-nums text-white">{String(safeIndex + 1).padStart(2, '0')}</span>
          <span className="text-[10px] text-white/40">/</span>
          <span className="text-[11px] tabular-nums">{String(activeSlides.length).padStart(2, '0')}</span>
        </div>
      )}

      {/* ── Arrows (visible on all screen sizes) ── */}
      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goPrev(true)}
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/40 active:scale-95 sm:h-12 sm:w-12 md:left-5"
            aria-label={t('slideshow.prev')}
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goNext(true)}
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/40 active:scale-95 sm:h-12 sm:w-12 md:right-5"
            aria-label={t('slideshow.next')}
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* ── Dot indicators ── */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-9 left-0 right-0 z-20 flex justify-center gap-2">
          {activeSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => {
                pauseAutoplay()
                setIndex(i)
              }}
              aria-label={t('slideshow.goTo', { index: i + 1 })}
              className={`rounded-full transition-all duration-500 ease-out ${
                i === safeIndex
                  ? 'h-2 w-9 bg-[#d3b18a]'
                  : 'h-2 w-2 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Progress bar ── */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/8">
          <div
            key={safeIndex}
            className="h-full origin-left bg-[#d3b18a]/70"
            style={{ animation: `slideProgress ${INTERVAL}ms linear forwards` }}
          />
        </div>
      )}
    </section>
  )
}
