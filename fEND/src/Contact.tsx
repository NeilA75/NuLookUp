import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Setting from '../components/Setting'
import SettingsModal from '../components/SettingsModal'
import type { Settings } from './main'
import NavBar from '../components/NavBar'

function DotGrid() {
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
        const o =
          0.06 +
          0.1 *
            Math.sin(t * d.speed + d.x * 0.02 + d.y * 0.01)

        ctx.beginPath()
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(56,189,248,${o})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

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
    animationMode,
    setAnimationMode,
    motionMode,
    setMotionMode,
    notifications,
    setNotifications,
  } = settings

  return (
    <div className="min-h-screen bg-[#060d1a] relative overflow-hidden">
        <NavBar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
      `}</style>

      <DotGrid />

      {/* Settings button */}
      <div className="absolute top-4 left-4 z-50">
        <Setting onClick={() => setShowModal(true)} />
      </div>

      {showModal && (
        <SettingsModal
          onClose={() => setShowModal(false)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          animationMode={animationMode}
          setAnimationMode={setAnimationMode}
          motionMode={motionMode}
          setMotionMode={setMotionMode}
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}

      {/* Background glow */}
      <div className="fixed -top-28 -left-24 w-[500px] h-[500px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 65%)' }} />

      <div className="fixed -bottom-20 -right-20 w-[400px] h-[400px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)' }} />

      <div className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      {/* Content */}
      <div className="relative z-[2] flex flex-col items-center justify-center min-h-screen gap-y-30">

        <h1 className="text-[50px] font-bold text-white [text-shadow:0_0_10px_#38bdf8,0_0_25px_#38bdf8]">
          Contact
        </h1>

        <div className="flex flex-row gap-x-[100px]">

          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='border border-sky-400/40 bg-white w-[240px] h-[250px] rounded-2xl shadow-[0_0_10px_rgba(56,189,248,0.6),0_0_40px_rgba(56,189,248,0.4)]'
          >
            <h1 className='font-bold text-[18px] text-center mt-[40px]'>
              hello@nulookup.com
            </h1>
            <p className='mt-[30px] text-[15px] text-center'>
              For general questions, comments, partnerships, and first-time contact with the NuLookUp team.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className='border border-sky-400/40 bg-white w-[240px] h-[250px] rounded-2xl shadow-[0_0_10px_rgba(56,189,248,0.6),0_0_40px_rgba(56,189,248,0.4)]'
          >
            <h1 className='font-bold text-[18px] text-center mt-[40px]'>
              support@nulookup.com
            </h1>
            <p className='mt-[30px] text-[15px] text-center'>
              For bug reports, technical issues, troubleshooting, and help using the platform.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className='border border-sky-400/40 bg-white w-[240px] h-[250px] rounded-2xl shadow-[0_0_10px_rgba(56,189,248,0.6),0_0_40px_rgba(56,189,248,0.4)]'
          >
            <h1 className='font-bold text-[18px] text-center mt-[40px]'>
              feedback@nulookup.com
            </h1>
            <p className='mt-[30px] text-[15px] text-center'>
              For feature requests, improvement suggestions, ideas, and user feedback to help shape future updates.
            </p>
          </motion.div>

        </div>
        <p className="text-white font-bold text-[15px] text-center max-w-[950px] mx-auto text-shadow-[0_0_10px_rgba(56,189,248,0.6),0_0_40px_rgba(56,189,248,0.4)]">
            For any inquiries, feel free to reach out via our email addresses. We’re always
            happy to assist with questions, feedback, or support requests, and we’ll get back
            to you as soon as possible.
        </p>
        
      </div>
    </div>
  )
}