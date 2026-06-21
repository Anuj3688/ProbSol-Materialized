import { useEffect, useState } from 'react'
import './Splash.css'

type SplashProps = {
  text?: string
  durationMs?: number
  onFinish?: () => void
}

export default function Splash({
  text = 'Nischal Tatvam Jivan Mukti',
  durationMs = 3000,
  onFinish,
}: SplashProps) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    const total = text.length
    const interval = Math.max(12, Math.floor(durationMs / Math.max(1, total)))
    let i = 0
    const id = setInterval(() => {
      i += 1
      setVisibleCount(i)
      if (i >= total) {
        clearInterval(id)
        // small pause before signalling finish so final letter is visible
        setTimeout(() => onFinish?.(), 200)
      }
    }, interval)

    return () => clearInterval(id)
  }, [text, durationMs, onFinish])

  return (
    <div className="splash-overlay">
      <div className="splash-text" aria-hidden>
        {text.split('').map((ch, idx) => (
          <span
            key={idx}
            className={`char ${idx < visibleCount ? 'visible' : ''}`}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </div>
    </div>
  )
}
