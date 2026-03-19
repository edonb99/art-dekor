export default function PageHero({ image, eyebrow, title, subtitle }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0">
        <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(10,9,8,0.76),rgba(10,9,8,0.45),rgba(10,9,8,0.72))]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 md:pb-24 md:pt-32">
        <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[#d6b58a]" style={{ animation: 'fadeUp 0.55s ease-out' }}>{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-5xl md:text-6xl" style={{ animation: 'fadeUp 0.55s 0.08s ease-out both' }}>{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-sm text-[#e9ddce] sm:text-base md:text-lg" style={{ animation: 'fadeUp 0.55s 0.16s ease-out both' }}>{subtitle}</p>
        )}
      </div>
    </section>
  )
}
