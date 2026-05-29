import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Setting from '../components/Setting'
import SettingsModal from '../components/SettingsModal'
import type { Settings } from './main'
import NavBar from '../components/NavBar'

function DotGrid({ darkMode }: { darkMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resize()
    window.addEventListener('resize', resize)

    const spacing = 32
    const dots: { x: number; y: number; speed: number }[] = []

    for (let x = 0; x < 2000; x += spacing) {
      for (let y = 0; y < 2000; y += spacing) {
        dots.push({
          x,
          y,
          speed: 0.003 + Math.random() * 0.005,
        })
      }
    }

    let t = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t++
      dots.forEach((d) => {
        const o = 0.06 + 0.1 * Math.sin(t * d.speed + d.x * 0.02 + d.y * 0.01)
        ctx.beginPath()
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = darkMode
          ? `rgba(56,189,248,${o})`
          : `rgba(56,189,248,${o})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [darkMode])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    />
  )
}

export default function Contact({ settings }: { settings: Settings }) {
  const [showModal, setShowModal] = useState(false)

  const {
    darkMode,
    setDarkMode,
    motionMode,
    setMotionMode,
    notifications,
    setNotifications,
  } = settings

  const cardStyle = {
    background: darkMode
      ? 'linear-gradient(135deg, rgba(241,245,249,0.97), rgba(226,232,240,0.92))'
      : 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))',
    border: darkMode
      ? '1px solid rgba(14,165,233,0.2)'
      : '1px solid rgba(56,189,248,0.4)',
    boxShadow: darkMode
      ? '0 2px 12px rgba(0,0,0,0.06)'
      : '0 0 10px rgba(56,189,248,0.6), 0 0 40px rgba(56,189,248,0.4)',
  }

  const emailStyle = {
    fontFamily: "'IBM Plex Mono', monospace",
    color: darkMode ? '#0f172a' : '#e2e8f0',
  }

  const descStyle = {
    color: darkMode ? '#475569' : '#94a3b8',
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden font-sans transition-colors duration-300"
      style={{ background: darkMode ? '#f8fafc' : '#060d1a' }}
    >
      <NavBar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
      `}</style>

      <DotGrid darkMode={darkMode} />

      <Setting onClick={() => setShowModal(true)} />

      {showModal && (
        <SettingsModal
          onClose={() => setShowModal(false)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          motionMode={motionMode}
          setMotionMode={setMotionMode}
          notifications={notifications}
          setNotifications={setNotifications}
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

      {/* Content */}
      <div className="relative z-[2] flex flex-col items-center justify-center min-h-screen gap-y-14 px-6 py-20">

        <h1
          className="text-[50px] font-bold"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: darkMode ? '#0f172a' : 'white',
            textShadow: darkMode
              ? '0 0 10px rgba(2,132,199,0.25), 0 0 25px rgba(2,132,199,0.15)'
              : '0 0 10px #38bdf8, 0 0 25px #38bdf8',
          }}
        >
          Contact
        </h1>

        <div className="flex flex-row flex-wrap justify-center gap-8">

          {/* Card 1 */}
          <motion.div
            initial={{ opacity: motionMode ? 1 : 0, y: motionMode ? 0 : 40, scale: motionMode ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={motionMode ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
            className="w-[240px] h-[250px] rounded-2xl backdrop-blur-md"
            style={cardStyle}
            whileHover={motionMode ? undefined : {
              y: -2,
              boxShadow: darkMode
                ? '0 4px 20px rgba(2,132,199,0.15)'
                : '0 0 20px rgba(56,189,248,0.7), 0 0 50px rgba(56,189,248,0.45)',
            }}
          >
            <h2
              className="font-bold text-[16px] text-center mt-10 px-4"
              style={emailStyle}
            >
              hello@nulookup.com
            </h2>
            <p className="mt-6 text-[14px] text-center px-4" style={descStyle}>
              For general questions, comments, partnerships, and first-time contact with the NuLookUp team.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: motionMode ? 1 : 0, y: motionMode ? 0 : 40, scale: motionMode ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={motionMode ? { duration: 0 } : { duration: 0.5, delay: 0.35 }}
            className="w-[240px] h-[250px] rounded-2xl backdrop-blur-md"
            style={cardStyle}
            whileHover={motionMode ? undefined : {
              y: -2,
              boxShadow: darkMode
                ? '0 4px 20px rgba(2,132,199,0.15)'
                : '0 0 20px rgba(56,189,248,0.7), 0 0 50px rgba(56,189,248,0.45)',
            }}
          >
            <h2
              className="font-bold text-[16px] text-center mt-10 px-4"
              style={emailStyle}
            >
              support@nulookup.com
            </h2>
            <p className="mt-6 text-[14px] text-center px-4" style={descStyle}>
              For bug reports, technical issues, troubleshooting, and help using the platform.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: motionMode ? 1 : 0, y: motionMode ? 0 : 40, scale: motionMode ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={motionMode ? { duration: 0 } : { duration: 0.5, delay: 0.5 }}
            className="w-[240px] h-[250px] rounded-2xl backdrop-blur-md"
            style={cardStyle}
            whileHover={motionMode ? undefined : {
              y: -2,
              boxShadow: darkMode
                ? '0 4px 20px rgba(2,132,199,0.15)'
                : '0 0 20px rgba(56,189,248,0.7), 0 0 50px rgba(56,189,248,0.45)',
            }}
          >
            <h2
              className="font-bold text-[16px] text-center mt-10 px-4"
              style={emailStyle}
            >
              feedback@nulookup.com
            </h2>
            <p className="mt-6 text-[14px] text-center px-4" style={descStyle}>
              For feature requests, improvement suggestions, ideas, and user feedback to help shape future updates.
            </p>
          </motion.div>

        </div>

        <p
          className="text-[15px] text-center max-w-[750px] leading-relaxed transition-colors duration-300"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: darkMode ? '#475569' : '#64748b',
          }}
        >
          For any inquiries, feel free to reach out via our email addresses. We're always
          happy to assist with questions, feedback, or support requests, and we'll get back
          to you as soon as possible.
        </p>

      </div>
    </div>
  )
}