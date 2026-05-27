import { useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
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

function getTypeStyle(type: string) {
  const hash = type.toUpperCase().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return COLOR_PALETTES[hash % COLOR_PALETTES.length]
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

function DotGrid() {
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
        ctx.fillStyle = `rgba(56,189,248,${o})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />
}

function Card({ item, index }: { item: typeof recommendations[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-80px', amount: 0.3 })
  const isPositive = item.change.startsWith('+')
  const typeStyle = getTypeStyle(item.type)

  return (
    <motion.div
      ref={ref}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 40, scale: isInView ? 1 : 0.97 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="relative overflow-hidden rounded-2xl p-5 cursor-pointer backdrop-blur-md"
      style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))', border: '1px solid rgba(56,189,248,0.15)' }}
      whileHover={{ borderColor: typeStyle.border, boxShadow: `0 0 30px ${typeStyle.bg}, 0 8px 32px rgba(0,0,0,0.4)`, y: -2 }}
    >
      <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${isPositive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'} 0%, transparent 70%)` }} />

      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-slate-200" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{item.title}</h3>
          <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
        </div>
        <div className="flex flex-col items-end shrink-0 ml-4">
          <span className="flex items-center justify-center px-3 py-0.5 rounded-full text-[0.65rem] mb-2"
            style={{ fontFamily: "'IBM Plex Mono', monospace", background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>
            {item.type}
          </span>
          <span className="text-lg font-bold text-slate-100" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{item.value}</span>
          <span className={`text-sm font-semibold mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{item.change}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home({ settings }: { settings: Settings }) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'graph' | 'fading' | 'done'>('graph')
  const [showModal, setShowModal] = useState(false)

  const { darkMode, setDarkMode, animationMode, setAnimationMode, motionMode, setMotionMode, notifications, setNotifications } = settings

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fading'), 2200)
    const t2 = setTimeout(() => setPhase('done'), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="min-h-screen bg-[#060d1a] relative overflow-hidden font-sans">
      <NavBar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .animate-pulse-dot { animation: pulse 2s infinite; }
      `}</style>

      <DotGrid />
      <Setting onClick={() => setShowModal(true)} />

      {showModal && (
        <SettingsModal
          onClose={() => setShowModal(false)}
          darkMode={darkMode} setDarkMode={setDarkMode}
          animationMode={animationMode} setAnimationMode={setAnimationMode}
          motionMode={motionMode} setMotionMode={setMotionMode}
          notifications={notifications} setNotifications={setNotifications}
        />
      )}

      <div className="fixed -top-28 -left-24 w-[500px] h-[500px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 65%)' }} />
      <div className="fixed -bottom-20 -right-20 w-[400px] h-[400px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)' }} />
      <div className="fixed inset-0 z-[1] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />

      <AnimatePresence>
        {phase !== 'done' && (
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'done' ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-[2]"
      >
        <div className="flex flex-col items-center text-center px-6 pt-20 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: phase === 'done' ? 1 : 0, y: phase === 'done' ? 0 : -16 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[0.7rem] tracking-[0.25em] uppercase text-sky-400 border border-sky-400/30 px-4 py-1 rounded-full inline-block mb-6 bg-sky-400/5"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Universal Lookup
            </span>

            <h1 className="font-extrabold tracking-tighter leading-none mb-4"
              style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontFamily: "'IBM Plex Mono', monospace", background: 'linear-gradient(135deg, #e2e8f0 0%, #38bdf8 50%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              NuLookup
            </h1>

            <p className="text-slate-500 text-base max-w-md leading-relaxed mb-10">
              Search anything — stocks, crypto, cars, clothing, currencies, and more.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: phase === 'done' ? 1 : 0, y: phase === 'done' ? 0 : 16 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex gap-3 w-full max-w-[520px]"
          >
            <input
              className="flex-1 px-5 py-3 rounded-xl text-slate-200 text-[0.95rem] outline-none bg-slate-900/80"
              style={{ fontFamily: "'IBM Plex Mono', monospace", border: '1px solid rgba(56,189,248,0.25)' }}
              placeholder="Search anything..."
            />
            <button
              className="px-6 py-3 rounded-xl text-white font-bold text-sm cursor-pointer border-none"
              style={{ fontFamily: "'IBM Plex Mono', monospace", background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 0 20px rgba(56,189,248,0.25)' }}>
              Search
            </button>
          </motion.div>

          <button onClick={() => navigate('/')}
            className="mt-5 text-sm text-slate-500 bg-transparent border-none cursor-pointer hover:text-slate-300 transition-colors"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            ← back to start
          </button>
        </div>

        <div className="max-w-[680px] mx-auto px-6 pb-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse-dot"
              style={{ boxShadow: '0 0 8px #10b981' }} />
            <h2 className="text-[0.85rem] text-slate-500 tracking-[0.15em] uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Recommended
            </h2>
          </div>
          <div className="flex flex-col gap-3.5">
            {recommendations.map((item, i) => (
              <Card key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

