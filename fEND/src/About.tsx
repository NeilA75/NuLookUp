import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import SettingsModal from '../components/SettingsModal'
import Setting from '../components/Setting'
import type { Settings } from './main'
import NavBar from '../components/NavBar'

const team = [
  {
    name: 'Neil Aji',
    role: 'Founder & CEO',
    bio: 'Computer Science Student interested in creating interesting applications.',
    initials: 'NA',
    color: '#e6ed0c',
  },
  {
    name: 'Omar Barakat',
    role: 'Web Developer & Co-Founder',
    bio: 'Aspiring computer science major with interests in web development and artificial intelligence.',
    initials: 'OB',
    color: '#f50ace',
  },
]

const stats = [
  { value: '40+',   label: 'Data Sources' },
  { value: '12M+',  label: 'Daily Queries' },
  { value: '190+',  label: 'Countries' },
  { value: '99.9%', label: 'Uptime' },
]

function TeamCard({
  member,
  index,
  darkMode,
  motionMode,
}: {
  member: typeof team[0]
  index: number
  darkMode: boolean
  motionMode: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: motionMode ? 1 : 0, y: motionMode ? 0 : 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionMode ? { duration: 0 } : { duration: 0.5, delay: 0.3 + index * 0.12 }}
      className="relative rounded-2xl p-6 backdrop-blur-md"
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, rgba(241,245,249,0.97), rgba(226,232,240,0.92))'
          : 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))',
        border: darkMode
          ? '1px solid rgba(14,165,233,0.2)'
          : '1px solid rgba(56,189,248,0.15)',
        boxShadow: darkMode ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
      }}
      whileHover={motionMode ? undefined : {
        borderColor: member.color + '55',
        boxShadow: `0 0 30px ${member.color}22, 0 8px 32px ${darkMode ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.4)'}`,
        y: -3,
      }}
    >
      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4 font-bold text-lg"
        style={{
          background: member.color + '22',
          border: `1px solid ${member.color}55`,
          color: member.color,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {member.initials}
      </div>

      <h3
        className="font-bold text-base mb-0.5"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          color: darkMode ? '#0f172a' : '#e2e8f0',
        }}
      >
        {member.name}
      </h3>

      {/* Role badge */}
      <span
        className="text-[0.65rem] tracking-widest uppercase px-2 py-0.5 rounded-full inline-block mb-3"
        style={{
          background: member.color + '18',
          color: member.color,
          border: `1px solid ${member.color}44`,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {member.role}
      </span>

      <p
        className="text-sm leading-relaxed"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          color: darkMode ? '#475569' : '#64748b',
        }}
      >
        {member.bio}
      </p>
    </motion.div>
  )
}

export default function About({ settings }: { settings: Settings }) {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  // Extract settings properties for the modal
  const { darkMode, setDarkMode, motionMode, setMotionMode, notifications, setNotifications } = settings

  return (
    <div
      className="min-h-screen relative overflow-hidden font-sans transition-colors duration-300"
      style={{ background: darkMode ? '#f8fafc' : '#060d1a' }}
    >
      <NavBar />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');`}</style>

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

      {/* Main content */}
      <div className="relative z-[2] max-w-[720px] mx-auto px-6 py-20">

        {/* Back button */}
        <motion.button
          initial={{ opacity: motionMode ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={motionMode ? { duration: 0 } : { duration: 0.4 }}
          onClick={() => navigate('/')}
          className="text-sm bg-transparent border-none cursor-pointer transition-colors mb-12 block"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: darkMode ? '#94a3b8' : '#64748b',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = darkMode ? '#334155' : '#cbd5e1')}
          onMouseLeave={e => (e.currentTarget.style.color = darkMode ? '#94a3b8' : '#64748b')}
        >
          ← back to start
        </motion.button>

        {/* Page header */}
        <motion.div
          initial={{ opacity: motionMode ? 1 : 0, y: motionMode ? 0 : -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionMode ? { duration: 0 } : { duration: 0.55 }}
          className="mb-16"
        >
          {/* Eyebrow badge */}
          <span
            className="text-[0.7rem] tracking-[0.25em] uppercase border px-4 py-1 rounded-full inline-block mb-6 transition-colors duration-300"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: darkMode ? '#0284c7' : '#38bdf8',
              borderColor: darkMode ? 'rgba(2,132,199,0.35)' : 'rgba(56,189,248,0.30)',
              background: darkMode ? 'rgba(2,132,199,0.06)' : 'rgba(56,189,248,0.05)',
            }}
          >
            About Us
          </span>

          <h1
            className="font-extrabold tracking-tighter leading-none mb-5 text-transparent bg-clip-text"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              fontFamily: "'IBM Plex Mono', monospace",
              backgroundImage: darkMode
                ? 'linear-gradient(135deg, #000000, #71717a, #cbd5e1)'
                : 'linear-gradient(135deg, #e2e8f0 0%, #38bdf8 50%, #818cf8 100%)',
            }}
          >
            Built for Clarity
          </h1>

          <p
            className="text-base max-w-lg leading-relaxed transition-colors duration-300"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: darkMode ? '#475569' : '#94a3b8',
            }}
          >
            NuLookUp was born from a simple frustration: too many apps, too many tabs,
            too much noise. We built one place to look up anything — fast, clean, and honest.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: motionMode ? 1 : 0, y: motionMode ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionMode ? { duration: 0 } : { duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 gap-4 mb-16 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4 text-center transition-colors duration-300"
              style={{
                background: darkMode
                  ? 'rgba(241,245,249,0.8)'
                  : 'rgba(15,23,42,0.8)',
                border: darkMode
                  ? '1px solid rgba(14,165,233,0.15)'
                  : '1px solid rgba(56,189,248,0.12)',
              }}
            >
              <div
                className="text-2xl font-bold mb-1 text-transparent bg-clip-text"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  backgroundImage: darkMode
                    ? 'linear-gradient(135deg, #0284c7, #4338ca)'
                    : 'linear-gradient(135deg, #38bdf8, #818cf8)',
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-[0.65rem] tracking-widest uppercase transition-colors duration-300"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: darkMode ? '#64748b' : '#475569',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Mission section */}
        <motion.div
          initial={{ opacity: motionMode ? 1 : 0, y: motionMode ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionMode ? { duration: 0 } : { duration: 0.5, delay: 0.22 }}
          className="rounded-2xl p-8 mb-16 backdrop-blur-md transition-colors duration-300"
          style={{
            background: darkMode
              ? 'linear-gradient(135deg, rgba(241,245,249,0.97), rgba(226,232,240,0.92))'
              : 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))',
            border: darkMode
              ? '1px solid rgba(14,165,233,0.2)'
              : '1px solid rgba(56,189,248,0.15)',
            boxShadow: darkMode ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          <h2
            className="font-bold text-xl mb-4 transition-colors duration-300"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: darkMode ? '#0f172a' : '#e2e8f0',
            }}
          >
            Our Mission
          </h2>
          <p
            className="leading-relaxed text-sm mb-4 transition-colors duration-300"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: darkMode ? '#475569' : '#64748b',
            }}
          >
            Financial data, vehicle pricing, retail inventory — it's all siloed.
            Professionals pay thousands for Bloomberg terminals. Consumers get ad-riddled
            comparison sites. We think that's broken.
          </p>
          <p
            className="leading-relaxed text-sm transition-colors duration-300"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: darkMode ? '#475569' : '#64748b',
            }}
          >
            NuLookUp aggregates 40+ real-time data sources into a single, unified search
            experience — no account required, no paywalls, no noise.
          </p>
        </motion.div>

        {/* Team heading */}
        <motion.div
          initial={{ opacity: motionMode ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={motionMode ? { duration: 0 } : { duration: 0.4, delay: 0.28 }}
          className="flex items-center gap-3 mb-6"
        >
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{
              background: darkMode ? '#0284c7' : '#38bdf8',
              boxShadow: darkMode ? '0 0 8px #0284c7' : '0 0 8px #38bdf8',
            }}
          />
          <h2
            className="text-[0.85rem] tracking-[0.15em] uppercase transition-colors duration-300"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: darkMode ? '#64748b' : '#64748b',
            }}
          >
            The Team
          </h2>
        </motion.div>

        {/* Team cards */}
        <div className="flex flex-col gap-4 mb-20">
          {team.map((member, i) => (
            <TeamCard key={member.name} member={member} index={i} darkMode={darkMode} motionMode={motionMode} />
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: motionMode ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={motionMode ? { duration: 0 } : { duration: 0.4, delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/Home')}
            className="px-10 py-4 rounded-xl text-white font-bold text-base cursor-pointer hover:opacity-90 transition-opacity border-none"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              background: darkMode
                ? 'linear-gradient(135deg, #000000, #71717a, #cbd5e1)'
                : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              boxShadow: darkMode
                ? '0 0 20px rgba(2,132,199,0.2)'
                : '0 0 24px rgba(56,189,248,0.2)',
            }}
          >
            Start Searching →
          </button>
        </motion.div>

      </div>
    </div>
  )
}