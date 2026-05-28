import { useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useEffect, useState, type FormEvent } from 'react'
import SettingsModal from '../components/SettingsModal'
import Setting from '../components/Setting'
import type { Settings } from './main'
import NavBar from '../components/NavBar'

const recommendations = [
  { title: 'NVIDIA',        type: 'STOCK',     value: '$875.39', change: '+4.2%',  desc: 'AI chip leader driving next-gen compute' },
  { title: 'Bitcoin',       type: 'CRYPTO',    value: '$63,200', change: '+5.7%',  desc: 'Decentralized digital store of value' },
  { title: 'Nike Air Max',  type: 'CLOTHING',  value: '$189.99', change: '+12.0%', desc: 'Iconic sneaker with Air cushioning' },
  { title: 'Toyota Camry',  type: 'CAR',       value: '$28,400', change: '+3.1%',  desc: 'Reliable mid-size sedan' },
  { title: 'EUR/USD',       type: 'FOREX',     value: '1.0842',  change: '-0.2%',  desc: 'Euro to US Dollar exchange rate' },
  { title: 'Gold',          type: 'COMMODITY', value: '$2,318',  change: '+1.4%',  desc: 'Safe-haven precious metal' },
  { title: 'Crude Oil',     type: 'ENERGY',    value: '$83.10',  change: '-0.9%',  desc: 'WTI benchmark crude futures' },
  { title: "Levi's 501",    type: 'CLOTHING',  value: '$69.50',  change: '+5.0%',  desc: 'Classic straight-fit denim jeans' },
  { title: 'Tesla Model 3', type: 'CAR',       value: '$40,240', change: '-1.2%',  desc: 'Best-selling electric sedan' },
  { title: 'Apple',         type: 'STOCK',     value: '$195.21', change: '+1.1%',  desc: 'Ecosystem powerhouse & silicon innovation' },
  { title: 'Ethereum',      type: 'CRYPTO',    value: '$3,120',  change: '+3.1%',  desc: 'Smart contract platform' },
  { title: 'JPY/USD',       type: 'FOREX',     value: '0.0066',  change: '+0.4%',  desc: 'Japanese Yen to US Dollar' },
]

const COLOR_PALETTES = [
  { bg: 'rgba(56,189,248,0.12)',  color: '#38bdf8', border: 'rgba(56,189,248,0.3)'  },
  { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', border: 'rgba(251,191,36,0.3)'  },
  { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8', border: 'rgba(99,102,241,0.3)'  },
  { bg: 'rgba(52,211,153,0.15)',  color: '#34d399', border: 'rgba(52,211,153,0.3)'  },
  { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c', border: 'rgba(251,146,60,0.3)'  },
  { bg: 'rgba(232,121,249,0.15)', color: '#e879f9', border: 'rgba(232,121,249,0.3)' },
  { bg: 'rgba(163,230,53,0.15)',  color: '#a3e635', border: 'rgba(163,230,53,0.3)'  },
  { bg: 'rgba(251,113,133,0.15)', color: '#fb7185', border: 'rgba(251,113,133,0.3)' },
]

const COLOR_PALETTES_LIGHT = [
  { bg: 'rgba(56,189,248,0.12)',  color: '#0284c7', border: 'rgba(2,132,199,0.3)'   },
  { bg: 'rgba(251,191,36,0.15)',  color: '#b45309', border: 'rgba(180,83,9,0.3)'    },
  { bg: 'rgba(99,102,241,0.15)',  color: '#4338ca', border: 'rgba(67,56,202,0.3)'   },
  { bg: 'rgba(52,211,153,0.15)',  color: '#047857', border: 'rgba(4,120,87,0.3)'    },
  { bg: 'rgba(251,146,60,0.15)',  color: '#c2410c', border: 'rgba(194,65,12,0.3)'   },
  { bg: 'rgba(232,121,249,0.15)', color: '#a21caf', border: 'rgba(162,28,175,0.3)'  },
  { bg: 'rgba(163,230,53,0.15)',  color: '#4d7c0f', border: 'rgba(77,124,15,0.3)'   },
  { bg: 'rgba(251,113,133,0.15)', color: '#be123c', border: 'rgba(190,18,60,0.3)'   },
]

function getTypeStyle(type: string, darkMode: boolean) {
  const hash = type.toUpperCase().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const palette = darkMode ? COLOR_PALETTES_LIGHT : COLOR_PALETTES
  return palette[hash % palette.length]
}

function IntroGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pts: { x: number; y: number }[] = []
    const n = 80
    let y = canvas.height * 0.75
    for (let i = 0; i <= n; i++) {
      const trend = (i / n) * canvas.height * 0.55
      const noise = (Math.random() - 0.3) * 28
      y = Math.max(40, canvas.height * 0.82 - trend + noise)
      pts.push({ x: (i / n) * canvas.width, y })
    }

    let progress = 0
    const totalFrames = 90
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const end = Math.floor(progress * pts.length)
      if (end < 2) { progress += 1 / totalFrames; animId = requestAnimationFrame(draw); return }

      const slice = pts.slice(0, end)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      grad.addColorStop(0, 'rgba(239,68,68,0.35)')
      grad.addColorStop(1, 'rgba(239,68,68,0)')
      ctx.beginPath()
      ctx.moveTo(slice[0].x, canvas.height)
      slice.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.lineTo(slice[slice.length - 1].x, canvas.height)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(slice[0].x, slice[0].y)
      slice.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2.5
      ctx.shadowColor = '#ef4444'
      ctx.shadowBlur = 12
      ctx.stroke()

      const tip = slice[slice.length - 1]
      ctx.beginPath()
      ctx.arc(tip.x, tip.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#ef4444'
      ctx.shadowBlur = 20
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.strokeStyle = 'rgba(239,68,68,0.08)'
      ctx.lineWidth = 1
      for (let i = 1; i <= 5; i++) {
        const gy = (canvas.height / 6) * i
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.lineTo(canvas.width, gy)
        ctx.stroke()
      }

      if (progress < 1) { progress += 1 / totalFrames; animId = requestAnimationFrame(draw) }
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

function DotGrid({ darkMode }: { darkMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const spacing = 32
    const dots: { x: number; y: number; speed: number }[] = []
    for (let x = 0; x < 2000; x += spacing)
      for (let y = 0; y < 2000; y += spacing)
        dots.push({ x, y, speed: 0.003 + Math.random() * 0.005 })

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t++
      dots.forEach(d => {
        const o = 0.06 + 0.1 * Math.sin(t * d.speed + d.x * 0.02 + d.y * 0.01)
        ctx.beginPath()
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = darkMode
          ? `rgba(14,165,233,${o})`
          : `rgba(56,189,248,${o})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [darkMode])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />
}

function Card({
  item,
  index,
  darkMode,
  motionMode,
}: {
  item: typeof recommendations[0]
  index: number
  darkMode: boolean
  motionMode: boolean
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-80px', amount: 0.3 })
  const isPositive = item.change.startsWith('+')
  const typeStyle = getTypeStyle(item.type, darkMode)

  // When motion is disabled, cards are always fully visible with no animation
  const animateProps = motionMode
    ? { opacity: 1, y: 0, scale: 1 }
    : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 40, scale: isInView ? 1 : 0.97 }

  return (
    <motion.div
      ref={ref}
      animate={animateProps}
      transition={motionMode ? { duration: 0 } : { duration: 0.45, delay: index * 0.06 }}
      className="relative overflow-hidden rounded-2xl p-5 cursor-pointer backdrop-blur-md"
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, rgba(241,245,249,0.97), rgba(226,232,240,0.92))'
          : 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))',
        border: darkMode
          ? '1px solid rgba(14,165,233,0.2)'
          : '1px solid rgba(56,189,248,0.15)',
        boxShadow: darkMode ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
      }}
      // No hover animation when motion is disabled
      whileHover={motionMode ? undefined : {
        borderColor: typeStyle.border,
        boxShadow: `0 0 30px ${typeStyle.bg}, 0 8px 32px ${darkMode ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.4)'}`,
        y: -2,
      }}
    >
      <div
        className="absolute top-0 left-0 w-16 h-16 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${
            isPositive
              ? darkMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.2)'
              : darkMode ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.15)'
          } 0%, transparent 70%)`,
        }}
      />

      <div className="flex justify-between items-start">
        <div>
          <h3
            className="text-lg font-bold"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: darkMode ? '#0f172a' : '#e2e8f0',
            }}
          >
            {item.title}
          </h3>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>
            {item.desc}
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0 ml-4">
          <span
            className="flex items-center justify-center px-3 py-0.5 rounded-full text-[0.65rem] mb-2"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              background: typeStyle.bg,
              color: typeStyle.color,
              border: `1px solid ${typeStyle.border}`,
            }}
          >
            {item.type}
          </span>
          <span
            className="text-lg font-bold"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: darkMode ? '#0f172a' : '#f1f5f9',
            }}
          >
            {item.value}
          </span>
          <span
            className={`text-sm font-semibold mt-0.5 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {item.change}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function titleCase(input: string) {
  return input
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function Home({ settings }: { settings: Settings }) {
  const navigate = useNavigate()
  // When motion is disabled, skip the intro entirely by starting at 'done'
  const { darkMode, setDarkMode, motionMode, setMotionMode, notifications, setNotifications } = settings
  const [phase, setPhase] = useState<'graph' | 'fading' | 'done'>(motionMode ? 'done' : 'graph')
  const [showModal, setShowModal] = useState(false)
  const [searchText, setSearchText] = useState('')

  const { darkMode, setDarkMode, motionMode, setMotionMode, notifications, setNotifications } = settings

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchText.trim()
    if (!trimmed) return
    navigate(`/Result?q=${encodeURIComponent(titleCase(trimmed))}`)
  }

  useEffect(() => {
    // If motion is disabled, jump straight to done and skip the intro graph
    if (motionMode) {
      setPhase('done')
      return
    }
    setPhase('graph')
    const t1 = setTimeout(() => setPhase('fading'), 2200)
    const t2 = setTimeout(() => setPhase('done'), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [motionMode])

  return (
    <div
      className="min-h-screen relative overflow-hidden font-sans transition-colors duration-300"
      style={{ background: darkMode ? '#f8fafc' : '#060d1a' }}
    >
      <NavBar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .animate-pulse-dot { animation: pulse 2s infinite; }
      `}</style>

      <DotGrid darkMode={darkMode} />
      <Setting onClick={() => setShowModal(true)} />

      {showModal && (
        <SettingsModal
          onClose={() => setShowModal(false)}
          darkMode={darkMode} setDarkMode={setDarkMode}
          motionMode={motionMode} setMotionMode={setMotionMode}
          notifications={notifications} setNotifications={setNotifications}
        />
      )}

      {/* Ambient glows */}
      <div
        className="fixed -top-28 -left-24 w-[500px] h-[500px] pointer-events-none z-0"
        style={{
          background: darkMode
            ? 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 65%)',
        }}
      />
      <div
        className="fixed -bottom-20 -right-20 w-[400px] h-[400px] pointer-events-none z-0"
        style={{
          background: darkMode
            ? 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)',
        }}
      />
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: darkMode
            ? 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)'
            : 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      {/* Intro animation overlay — skipped entirely when motion is disabled */}
      <AnimatePresence>
        {phase !== 'done' && !motionMode && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === 'fading' ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-10 pointer-events-none"
          >
            <div className="absolute inset-0 bg-[rgba(6,13,26,0.7)]" />
            <IntroGraph />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[0.75rem] tracking-[0.25em] uppercase text-red-400/70"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Initializing markets...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        // When motion is disabled, no fade-in — content is immediately visible
        initial={{ opacity: motionMode ? 1 : 0 }}
        animate={{ opacity: phase === 'done' ? 1 : 0 }}
        transition={motionMode ? { duration: 0 } : { duration: 0.7 }}
        className="relative z-[2]"
      >
        <div className="flex flex-col items-center text-center px-6 pt-20 pb-12">
          <motion.div
            initial={{ opacity: motionMode ? 1 : 0, y: motionMode ? 0 : -16 }}
            animate={{ opacity: phase === 'done' ? 1 : 0, y: phase === 'done' ? 0 : -16 }}
            transition={motionMode ? { duration: 0 } : { duration: 0.6 }}
          >
            {/* Badge */}
            <span
              className="text-[0.7rem] tracking-[0.25em] uppercase border px-4 py-1 rounded-full inline-block mb-6 transition-colors duration-300"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: darkMode ? '#0284c7' : '#38bdf8',
                borderColor: darkMode ? 'rgba(2,132,199,0.35)' : 'rgba(56,189,248,0.30)',
                background: darkMode ? 'rgba(2,132,199,0.06)' : 'rgba(56,189,248,0.05)',
              }}
            >
              Universal Lookup
            </span>

            {/* Title */}
            <h1
              className={`
                block font-extrabold tracking-tighter leading-none mb-4
                text-transparent bg-clip-text bg-gradient-to-br
                ${darkMode ? 'from-black via-zinc-400 to-slate-300' : 'from-slate-200 via-sky-400 to-indigo-400'}
              `}
              style={{
                fontSize: 'clamp(3rem, 8vw, 5rem)',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              NuLookup
            </h1>

            {/* Subtitle */}
            <p
              className="text-base max-w-md leading-relaxed mb-10 transition-colors duration-300"
              style={{ color: darkMode ? '#475569' : '#64748b' }}
            >
              Search anything — stocks, crypto, cars, clothing, currencies, and more.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: motionMode ? 1 : 0, y: motionMode ? 0 : 16 }}
            animate={{ opacity: phase === 'done' ? 1 : 0, y: phase === 'done' ? 0 : 16 }}
            transition={motionMode ? { duration: 0 } : { duration: 0.6, delay: 0.15 }}
            className="flex gap-3 w-full max-w-[520px]"
          >

            <form onSubmit={handleSearch} className="flex gap-3 w-full">
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="flex-1 px-5 py-3 rounded-xl text-[0.95rem] outline-none transition-colors duration-300"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  background: darkMode ? 'rgba(241,245,249,0.9)' : 'rgba(15,23,42,0.8)',
                  color: darkMode ? '#0f172a' : '#e2e8f0',
                  border: darkMode
                    ? '1px solid rgba(2,132,199,0.3)'
                    : '1px solid rgba(56,189,248,0.25)',
                }}
                placeholder="Search anything..."
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-white font-bold text-sm cursor-pointer border-none transition-all duration-300"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  background: darkMode
                    ? 'linear-gradient(135deg, #000000, #71717a, #cbd5e1)'
                    : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  boxShadow: darkMode
                    ? '0 0 20px rgba(2,132,199,0.2)'
                    : '0 0 20px rgba(56,189,248,0.25)',
                }}
              >
                Search
              </button>
            </form>

          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="mt-5 text-sm bg-transparent border-none cursor-pointer transition-colors duration-300"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: darkMode ? '#94a3b8' : '#64748b',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = darkMode ? '#334155' : '#cbd5e1')}
            onMouseLeave={e => (e.currentTarget.style.color = darkMode ? '#94a3b8' : '#64748b')}
          >
            ← back to start
          </button>
        </div>

        {/* Recommendations list */}
        <div className="max-w-[680px] mx-auto px-6 pb-24">
          <div className="flex items-center gap-3 mb-6">
            <span
              className="w-2 h-2 rounded-full inline-block animate-pulse-dot"
              style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }}
            />
            <h2
              className="text-[0.85rem] tracking-[0.15em] uppercase transition-colors duration-300"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: '#64748b',
              }}
            >
              Recommended
            </h2>
          </div>
          <div className="flex flex-col gap-3.5">
            {recommendations.map((item, i) => (
              <Card key={i} item={item} index={i} darkMode={darkMode} motionMode={motionMode} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}