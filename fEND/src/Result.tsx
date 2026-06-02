// ============================================================
// Result.tsx — Search Result Page for NuLookUp
// ============================================================

import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState, type FormEvent } from 'react'
import type { Settings } from './main'
import NavBar from '../components/NavBar'
import Setting from '../components/Setting'
import SettingsModal from '../components/SettingsModal'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface RealArticle {
  title: string
  link: string
  source: string
  date: string
  snippet: string
  thumbnail?: string
}

// ─────────────────────────────────────────────
// PLACEHOLDER DATA (price graph + summary still mocked)
// ─────────────────────────────────────────────

const PLACEHOLDER_PRICES: { day: string; price: number }[] = [
  { day: 'Jan', price: 152 },
  { day: 'Feb', price: 160 },
  { day: 'Mar', price: 145 },
  { day: 'Apr', price: 171 },
  { day: 'May', price: 168 },
  { day: 'Jun', price: 182 },
  { day: 'Jul', price: 178 },
  { day: 'Aug', price: 195 },
  { day: 'Sep', price: 189 },
  { day: 'Oct', price: 204 },
  { day: 'Nov', price: 198 },
  { day: 'Dec', price: 215 },
]

const PLACEHOLDER_AVG_PRICE = '$189.99'
const PLACEHOLDER_CHANGE = '+12.4%'
const PLACEHOLDER_CHANGE_POSITIVE = true

const PLACEHOLDER_SUMMARY =
  'The Nike Air Max series has maintained strong secondary market value throughout the year, driven by consistent demand from both athletic users and collectors. Recent colorway releases have pushed average resale premiums above 18% over retail. Supply constraints in sizes 9–11 continue to apply upward pressure on pricing across major platforms.'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function titleCase(input: string) {
  return input
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// ─────────────────────────────────────────────
// COMPONENT: TrendGraph
// ─────────────────────────────────────────────

function TrendGraph({ data }: { data: typeof PLACEHOLDER_PRICES }) {
  const W = 800
  const H = 220
  const PAD = { top: 20, right: 20, bottom: 36, left: 48 }

  const prices = data.map(d => d.price)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const range = maxP - minP || 1

  const toY = (p: number) =>
    PAD.top + ((maxP - p) / range) * (H - PAD.top - PAD.bottom)

  const toX = (i: number) =>
    PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right)

  const pathD = data.reduce((acc, d, i) => {
    const x = toX(i)
    const y = toY(d.price)
    if (i === 0) return `M ${x},${y}`
    const px = toX(i - 1)
    const py = toY(data[i - 1].price)
    const cpx = (px + x) / 2
    return `${acc} C ${cpx},${py} ${cpx},${y} ${x},${y}`
  }, '')

  const areaD = `${pathD} L ${toX(data.length - 1)},${H - PAD.bottom} L ${toX(0)},${H - PAD.bottom} Z`

  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const price = minP + (range * i) / 3
    return { y: toY(price), label: `$${Math.round(price)}` }
  })

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full h-full"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y}
            stroke="rgba(56,189,248,0.08)" strokeWidth="1" strokeDasharray="4 4"
          />
          <text
            x={PAD.left - 8} y={t.y + 4}
            fill="rgba(148,163,184,0.5)"
            fontSize="10" textAnchor="end"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {t.label}
          </text>
        </g>
      ))}

      {data.map((d, i) => (
        <text
          key={i}
          x={toX(i)} y={H - PAD.bottom + 16}
          fill="rgba(148,163,184,0.4)"
          fontSize="9" textAnchor="middle"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {d.day}
        </text>
      ))}

      <path d={areaD} fill="url(#areaGrad)" />

      <path
        d={pathD}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      <circle
        cx={toX(data.length - 1)}
        cy={toY(data[data.length - 1].price)}
        r="5"
        fill="#38bdf8"
        filter="url(#glow)"
      />
      <circle
        cx={toX(data.length - 1)}
        cy={toY(data[data.length - 1].price)}
        r="9"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
    </svg>
  )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT: Result
// ─────────────────────────────────────────────

export default function Result({ settings }: { settings: Settings }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)

  const {
    darkMode,
    setDarkMode,
    motionMode,
    setMotionMode,
    notifications,
    setNotifications,
  } = settings

  const [searchParams] = useSearchParams()
  const rawQuery = searchParams.get('q')?.trim() || ''
  const formattedQuery = rawQuery ? titleCase(rawQuery) : ''
  const displayQuery = formattedQuery || '[Placeholder Item]'
  const [searchText, setSearchText] = useState(formattedQuery)

  // ── Real articles from router state (passed by Home.tsx after fetch) ──
  const articles: RealArticle[] = location.state?.articles ?? []

  useEffect(() => {
    setSearchText(formattedQuery)
  }, [formattedQuery])

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchText.trim()
    if (!trimmed) return

    const response = await fetch(
      `http://localhost:3000/api/news?q=${encodeURIComponent(trimmed)}`
    )
    const data = await response.json()

    navigate(`/Result?q=${encodeURIComponent(titleCase(trimmed))}`, {
      state: { articles: data.articles },
    })
  }

  const isPositive = PLACEHOLDER_CHANGE_POSITIVE

  // Tag colors cycling for variety across articles
  const TAG_COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fb923c', '#e879f9', '#fbbf24', '#fb7185']

  return (
    <div
      className="min-h-screen relative overflow-hidden font-sans"
      style={{ background: '#060d1a', color: '#e2e8f0' }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');`}</style>

      <NavBar />
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
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 65%)' }}
      />
      <div
        className="fixed -bottom-20 -right-20 w-[400px] h-[400px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)' }}
      />
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      <div className="relative z-[2] max-w-[1100px] mx-auto px-6 py-10 pt-24">

        {/* ── Top nav: back + search bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/Home')}
            className="text-sm text-slate-500 bg-transparent border-none cursor-pointer hover:text-sky-400 transition-colors shrink-0"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            ← back
          </button>

          <span
            className="text-xs text-slate-400 uppercase tracking-[0.3em] ml-auto"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Result Settings
          </span>

          <form onSubmit={handleSearchSubmit} className="flex gap-3 flex-1 max-w-[520px]">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="flex-1 px-5 py-2.5 rounded-xl text-slate-200 text-[0.9rem] outline-none bg-slate-900/80"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                border: '1px solid rgba(56,189,248,0.25)',
              }}
              placeholder="Search anything..."
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer border-none"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              }}
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* ── Query label ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5 flex items-center gap-3"
        >
          <span
            className="w-2 h-2 rounded-full bg-sky-400 inline-block animate-pulse"
            style={{ boxShadow: '0 0 8px #38bdf8' }}
          />
          <span
            className="text-[0.7rem] tracking-[0.2em] uppercase text-slate-500"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Results for: <span className="text-sky-400">{displayQuery}</span>
          </span>
        </motion.div>

        {/* ── BOX 1: Trend graph + Price panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl overflow-hidden mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.85))',
            border: '1px solid rgba(56,189,248,0.15)',
            display: 'grid',
            gridTemplateColumns: '4fr 1fr',
          }}
        >
          {/* Left: Trend Graph */}
          <div className="p-6 border-r border-sky-400/10">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-slate-300 font-bold text-sm tracking-wide"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Price History — {displayQuery}
              </h2>
              <div className="flex gap-2">
                {['1M', '6M', '1Y', 'All'].map(range => (
                  <button
                    key={range}
                    className="text-[0.6rem] tracking-widest px-2.5 py-1 rounded-lg border-none cursor-pointer transition-colors"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      background: range === '1Y' ? 'rgba(56,189,248,0.15)' : 'transparent',
                      color: range === '1Y' ? '#38bdf8' : 'rgba(148,163,184,0.4)',
                      border: range === '1Y' ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full" style={{ height: '200px' }}>
              <TrendGraph data={PLACEHOLDER_PRICES} />
            </div>
          </div>

          {/* Right: Average Price + Change */}
          <div className="p-6 flex flex-col justify-center items-start gap-3">
            <span
              className="text-[0.6rem] tracking-[0.2em] uppercase text-slate-600"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Avg. Price
            </span>

            <div
              className="font-extrabold leading-none"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                background: 'linear-gradient(135deg, #e2e8f0, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {PLACEHOLDER_AVG_PRICE}
            </div>

            <div className="w-full h-px bg-sky-400/10" />

            <span
              className="text-[0.6rem] tracking-[0.2em] uppercase text-slate-600"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              12-Month Change
            </span>

            <div className="flex items-center gap-2">
              <span style={{ color: isPositive ? '#10b981' : '#ef4444', fontSize: '0.75rem' }}>
                {isPositive ? '▲' : '▼'}
              </span>
              <span
                className="font-bold text-xl"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: isPositive ? '#10b981' : '#ef4444',
                  textShadow: isPositive
                    ? '0 0 12px rgba(16,185,129,0.4)'
                    : '0 0 12px rgba(239,68,68,0.4)',
                }}
              >
                {PLACEHOLDER_CHANGE}
              </span>
            </div>

            <div
              className="text-[0.65rem] text-slate-600 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <div>Low: <span className="text-slate-400">[$$$]</span></div>
              <div>High: <span className="text-slate-400">[$$$]</span></div>
            </div>
          </div>
        </motion.div>

        {/* ── BOX 2: Summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.85))',
            border: '1px solid rgba(56,189,248,0.15)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-[0.6rem] tracking-[0.25em] uppercase text-sky-400 border border-sky-400/30 px-3 py-0.5 rounded-full bg-sky-400/5"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Summary
            </span>
            <span
              className="text-[0.6rem] tracking-[0.2em] uppercase px-3 py-0.5 rounded-full"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                background: 'rgba(99,102,241,0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              [???] Category
            </span>
          </div>

          <p
            className="text-slate-400 leading-relaxed text-sm max-w-4xl"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {PLACEHOLDER_SUMMARY}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-5 sm:grid-cols-4">
            {[
              { label: 'Retail Price', value: '[$$$]' },
              { label: 'Avg Resale',   value: '[$$$]' },
              { label: 'Premium',      value: '[$$$]' },
              { label: 'Last Sale',    value: '[$$$]' },
            ].map(f => (
              <div
                key={f.label}
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(56,189,248,0.04)',
                  border: '1px solid rgba(56,189,248,0.08)',
                }}
              >
                <div
                  className="text-[0.6rem] text-slate-600 uppercase tracking-widest mb-1"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {f.label}
                </div>
                <div
                  className="text-slate-300 font-bold text-base"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── BOX 3: Related Articles ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-3 mb-4"
        >
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: '#818cf8', boxShadow: '0 0 8px #818cf8' }}
          />
          <h2
            className="text-[0.75rem] text-slate-500 tracking-[0.15em] uppercase"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Related Articles
          </h2>
          {articles.length > 0 && (
            <span
              className="text-[0.6rem] text-slate-700 ml-1"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              ({articles.length})
            </span>
          )}
        </motion.div>

        {/* Article cards row */}
        <div className="flex gap-3 pb-16" style={{ alignItems: 'stretch' }}>
          {articles.length > 0 ? (
            articles.map((article, i) => {
              const tagColor = TAG_COLORS[i % TAG_COLORS.length]
              return (
                <motion.a
                  key={i}
                  href={article.link}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.5 + i * 0.08 }}
                  className="flex flex-col rounded-2xl p-5 cursor-pointer backdrop-blur-md min-h-[220px]"
                  style={{
                    background: 'linear-gradient(160deg, rgba(15,23,42,0.97), rgba(15,23,42,0.8))',
                    border: '1px solid rgba(56,189,248,0.12)',
                    flex: '1 1 0',
                    minWidth: '180px',
                    textDecoration: 'none',
                  }}
                  whileHover={{
                    borderColor: tagColor + '55',
                    boxShadow: `0 0 28px ${tagColor}18, 0 8px 32px rgba(0,0,0,0.5)`,
                    y: -3,
                  }}
                >
                  {/* Tag + date */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded-full"
                      style={{
                        background: tagColor + '18',
                        color: tagColor,
                        border: `1px solid ${tagColor}44`,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      NEWS
                    </span>
                    <span
                      className="text-[0.6rem] text-slate-600"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {article.date}
                    </span>
                  </div>

                  {/* Source */}
                  <p
                    className="text-[0.65rem] text-slate-600 uppercase tracking-widest mb-2"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {article.source}
                  </p>

                  {/* Headline */}
                  <h3
                      className="text-slate-200 font-bold text-sm leading-snug mb-3 flex-1"
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        display: '-webkit-box',
                        WebkitLineClamp: 3,         // max 3 lines
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {article.title}
                    </h3>

                    {/* Snippet */}
                    <p
                      className="text-slate-500 text-xs leading-relaxed"
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        display: '-webkit-box',
                        WebkitLineClamp: 3,         // max 3 lines
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {article.snippet}
                    </p>

                  {/* Read more */}
                  <div className="mt-4">
                    <span
                      className="text-[0.65rem] tracking-widest uppercase"
                      style={{ color: tagColor, fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      Read More →
                    </span>
                  </div>
                </motion.a>
              )
            })
          ) : (
            <p
              className="text-slate-600 text-sm"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              No articles found.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}