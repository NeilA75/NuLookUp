import { useNavigate } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import Setting from '../components/Setting'
import SettingsModal from '../components/SettingsModal'
import type { Settings } from './main'
import NavBar from "../components/NavBar"

function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
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
      dots.forEach((d) => {
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

  return <canvas className="fixed inset-0 w-full h-full z-0 pointer-events-none" ref={canvasRef} />
}

export default function App({ settings }: { settings: Settings }) {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const { darkMode, setDarkMode, animationMode, setAnimationMode, motionMode, setMotionMode, notifications, setNotifications } = settings

  return (
    <div className="min-h-screen bg-[#060d1a] relative overflow-hidden font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');`}</style>

      <DotGrid />

      <div className="fixed -top-28 -left-24 w-[500px] h-[500px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 65%)' }} />
      <div className="fixed -bottom-20 -right-20 w-[400px] h-[400px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)' }} />
      <div className="fixed inset-0 z-[1] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />

      <div className="relative z-[2] flex flex-col items-center justify-center min-h-screen text-center px-6">
        
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
        <NavBar />

        <div className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 0 25px rgba(239,68,68,0.15)', backdropFilter: 'blur(8px)' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <path d="M3 17L9 11L13 15L21 7" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 7V12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M21 7H16" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <span className="text-[0.7rem] tracking-[0.25em] uppercase text-sky-400 border border-sky-400/30 px-4 py-1 rounded-full inline-block mb-6 bg-sky-400/5"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Universal Lookup
        </span>

        <h1 className="font-extrabold tracking-tighter leading-none mb-4"
          style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', fontFamily: "'IBM Plex Mono', monospace", background: 'linear-gradient(135deg, #e2e8f0 0%, #38bdf8 50%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          NuLookUp
        </h1>

        <p className="text-slate-500 text-base max-w-md leading-relaxed mb-10"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Search anything — stocks, crypto, cars, clothing, currencies, and more.
        </p>

        <button onClick={() => navigate('/Home')}
          className="px-10 py-4 rounded-xl text-white font-bold text-base cursor-pointer hover:opacity-90 transition-opacity border-none"
          style={{ fontFamily: "'IBM Plex Mono', monospace", background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 0 24px rgba(56,189,248,0.2)' }}>
          Get Started →
        </button>

        <p className="absolute bottom-8 text-slate-600 text-xs tracking-widest uppercase"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Powered by NuLookUp
        </p>
      </div>
    </div>
  )
}
