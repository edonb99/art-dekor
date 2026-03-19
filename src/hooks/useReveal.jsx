import { useEffect, useRef, useState } from 'react'

export function useReveal({ threshold = 0.2, rootMargin = '0px' } = {}) {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!ref.current || revealed) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [revealed, rootMargin, threshold])

  return { ref, revealed }
}
