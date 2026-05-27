// ============================================================
// About.tsx — About Page for NuLookUp
// ============================================================
// In React, each file like this exports a "component" —
// think of it like a class with a render() method.
// Components return JSX, which looks like HTML but is
// actually JavaScript under the hood.
// ============================================================

import { useNavigate } from 'react-router-dom'   // Like a router.push() — lets us change pages
import { motion } from 'framer-motion'            // Animation library already used in Home.tsx
import { useState } from 'react'                  // State hook for managing UI
import SettingsModal from '../components/SettingsModal'
import Setting from '../components/Setting'
import type { Settings } from './main'            // TypeScript: import the Settings type (like a struct/interface)

// ─────────────────────────────────────────────
// DATA — defined outside the component so it's
// not re-created on every render (like a static
// constant in C/Java)
// ─────────────────────────────────────────────
const team = [
  {
    name: 'Neil Aji',
    role: 'Founder & CEO',
    bio: 'Computer Science Student interested in creating interesting applications.',
    initials: 'NA',
    color: '#e6ed0c',   // yellow
  },
  {
    name: 'Omar Barakat',
    role: 'Web Developer & Co-Founder',
    bio: 'Aspiring computer science major with interests in web development and artificial intelligence.',
    initials: 'OB',
    color: '#f50ace',   // pink
  },
]

const stats = [
  { value: '40+',  label: 'Data Sources' },
  { value: '12M+', label: 'Daily Queries' },
  { value: '190+', label: 'Countries' },
  { value: '99.9%', label: 'Uptime' },
]

// ─────────────────────────────────────────────
// COMPONENT: TeamCard
//
// This is a "child component" — a reusable piece
// of UI, like a helper function that returns HTML.
//
// Props are like function parameters.
// In TypeScript we declare their types inline:
//   { name: string, role: string, ... }
// ─────────────────────────────────────────────
function TeamCard({
  member,
  index,
}: {
  member: typeof team[0]   // "same shape as one element of the team array"
  index: number
}) {
  return (
    // motion.div = a regular <div> that can animate.
    // initial = starting state, animate = end state.
    // delay: index * 0.1 staggers each card (0s, 0.1s, 0.2s...)
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.12 }}
      className="relative rounded-2xl p-6 backdrop-blur-md"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))',
        border: '1px solid rgba(56,189,248,0.15)',
      }}
      // whileHover is like an onMouseEnter/onMouseLeave pair, but simpler
      whileHover={{
        borderColor: member.color + '55',
        boxShadow: `0 0 30px ${member.color}22, 0 8px 32px rgba(0,0,0,0.4)`,
        y: -3,
      }}
    >
      {/* Avatar circle — uses the member's accent color */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4 font-bold text-lg"
        style={{
          background: member.color + '22',      // hex color + '22' = 13% opacity
          border: `1px solid ${member.color}55`, // 55 = ~33% opacity
          color: member.color,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {member.initials}
      </div>

      <h3
        className="text-slate-200 font-bold text-base mb-0.5"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
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

      <p className="text-slate-500 text-sm leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        {member.bio}
      </p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT: About
//
// This is what gets exported and used in main.tsx.
// It receives `settings` as a prop — same pattern
// as App.tsx and Home.tsx in your codebase.
//
// The `{ settings }: { settings: Settings }` syntax
// is destructuring the props object, equivalent to:
//   function About(props) { const settings = props.settings }
// ─────────────────────────────────────────────
export default function About({ settings }: { settings: Settings }) {
  // useNavigate() returns a function — calling navigate('/path')
  // changes the page. Like window.location.href but for SPAs.
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  // Extract settings properties for the modal
  const { darkMode, setDarkMode, animationMode, setAnimationMode, motionMode, setMotionMode, notifications, setNotifications } = settings

  return (
    // Root container — matches the dark bg used in App.tsx and Home.tsx
    <div className="min-h-screen bg-[#060d1a] relative overflow-hidden font-sans">

      {/* Google Font import — same font as the rest of the app */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');`}</style>

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

      {/* ── Ambient glow blobs (decorative, pointer-events-none = non-interactive) ── */}
      <div
        className="fixed -top-28 -left-24 w-[500px] h-[500px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 65%)' }}
      />
      <div
        className="fixed -bottom-20 -right-20 w-[400px] h-[400px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)' }}
      />
      {/* Subtle scanline texture overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      {/* ── Main scrollable content, sits above the decorative layers ── */}
      <div className="relative z-[2] max-w-[720px] mx-auto px-6 py-20">

        {/* Back button — onClick is like an event listener (addEventListener('click', ...)) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate('/')}
          className="text-sm text-slate-500 bg-transparent border-none cursor-pointer hover:text-slate-300 transition-colors mb-12 block"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          ← back to start
        </motion.button>

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-16"
        >
          {/* Eyebrow label — same style as the "Universal Lookup" chip in App.tsx */}
          <span
            className="text-[0.7rem] tracking-[0.25em] uppercase text-sky-400 border border-sky-400/30 px-4 py-1 rounded-full inline-block mb-6 bg-sky-400/5"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            About Us
          </span>

          <h1
            className="font-extrabold tracking-tighter leading-none mb-5"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              fontFamily: "'IBM Plex Mono', monospace",
              // CSS gradient text — same technique as the NuLookUp logo
              background: 'linear-gradient(135deg, #e2e8f0 0%, #38bdf8 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Built for Clarity
          </h1>

          <p
            className="text-slate-400 text-base max-w-lg leading-relaxed"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            NuLookUp was born from a simple frustration: too many apps, too many tabs, 
            too much noise. We built one place to look up anything — fast, clean, and honest.
          </p>
        </motion.div>

        {/* ── Stats row ──
            .map() is like a for-each loop that returns JSX.
            The `key` prop is required by React when rendering lists —
            it helps React track which items changed (like a unique ID). */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 gap-4 mb-16 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4 text-center"
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(56,189,248,0.12)',
              }}
            >
              <div
                className="text-2xl font-bold mb-1"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-[0.65rem] text-slate-500 tracking-widest uppercase"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Mission section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="rounded-2xl p-8 mb-16"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))',
            border: '1px solid rgba(56,189,248,0.15)',
          }}
        >
          <h2
            className="text-slate-200 font-bold text-xl mb-4"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Our Mission
          </h2>
          <p
            className="text-slate-400 leading-relaxed text-sm mb-4"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Financial data, vehicle pricing, retail inventory — it's all siloed. 
            Professionals pay thousands for Bloomberg terminals. Consumers get ad-riddled 
            comparison sites. We think that's broken.
          </p>
          <p
            className="text-slate-400 leading-relaxed text-sm"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            NuLookUp aggregates 40+ real-time data sources into a single, unified search 
            experience — no account required, no paywalls, no noise.
          </p>
        </motion.div>

        {/* ── Team section ──
            Section heading with the same "live dot" style as Home.tsx */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="flex items-center gap-3 mb-6"
        >
          <span
            className="w-2 h-2 rounded-full bg-sky-400 inline-block"
            style={{ boxShadow: '0 0 8px #38bdf8' }}
          />
          <h2
            className="text-[0.85rem] text-slate-500 tracking-[0.15em] uppercase"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            The Team
          </h2>
        </motion.div>

        {/* Render one TeamCard per team member */}
        <div className="flex flex-col gap-4 mb-20">
          {team.map((member, i) => (
            // key= is React's way of identifying list items efficiently
            <TeamCard key={member.name} member={member} index={i} />
          ))}
        </div>

        {/* ── Footer CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/Home')}
            className="px-10 py-4 rounded-xl text-white font-bold text-base cursor-pointer hover:opacity-90 transition-opacity border-none"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              boxShadow: '0 0 24px rgba(56,189,248,0.2)',
            }}
          >
            Start Searching →
          </button>
        </motion.div>
      </div>
    </div>
  )
}