import { useReveal } from '../hooks/useReveal'

const HIDDEN = {
  bottom: 'opacity-0 translate-y-10',
  top:    'opacity-0 -translate-y-8',
  left:   'opacity-0 -translate-x-10',
  right:  'opacity-0 translate-x-10',
  scale:  'opacity-0 scale-95',
  fade:   'opacity-0',
}

export default function Reveal({ children, className = '', delay = 0, from = 'bottom' }) {
  const { ref, revealed } = useReveal()
  const hidden = HIDDEN[from] ?? HIDDEN.bottom

  return (
    <div
      ref={ref}
      className={`${className} will-change-transform transition-all duration-700 ease-out ${
        revealed ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : hidden
      }`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
