// ============================================================
// Result.tsx — Search Result Page for NuLookUp
// ============================================================
// Layout (top to bottom):
//
//  ┌─────────────────────────────┬──────────────┐
//  │                             │  Avg Price   │
//  │       Trend Graph (4/5)     │  Change ind. │
//  │                             │    (1/5)     │
//  └─────────────────────────────┴──────────────┘
//  ┌──────────────────────────────────────────────┐
//  │              Summary Box                     │
//  └──────────────────────────────────────────────┘
//  ┌───────────┐ ┌───────────┐ ┌───────────┐ ...
//  │  Article  │ │  Article  │ │  Article  │
//  └───────────┘ └───────────┘ └───────────┘
// ============================================================

import { useNavigate, useSearchParams } from 'react-router-dom'
// useSearchParams lets us read ?q=Nike+Air+Max from the URL
// — same idea as reading argv[] in C, but for the browser URL

import { motion } from 'framer-motion'
import { useEffect, useState, type FormEvent } from 'react'
import type { Settings } from './main'
import NavBar from '../components/NavBar'
import Setting from '../components/Setting'
import SettingsModal from '../components/SettingsModal'

// ─────────────────────────────────────────────
// PLACEHOLDER DATA
// Replace these with real API responses later.
// Think of these as mock structs for the backend contract.
// ─────────────────────────────────────────────

// Each point on the trend graph: { day, price }
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

// [$$$] — swap with real average from backend
const PLACEHOLDER_AVG_PRICE = '$189.99'

// [$$$] — swap with real % change from backend
const PLACEHOLDER_CHANGE = '+12.4%'
const PLACEHOLDER_CHANGE_POSITIVE = true // drives green vs red color

// [???] — swap with real summary text from backend/AI
const PLACEHOLDER_SUMMARY =
  'The Nike Air Max series has maintained strong secondary market value throughout the year, driven by consistent demand from both athletic users and collectors. Recent colorway releases have pushed average resale premiums above 18% over retail. Supply constraints in sizes 9–11 continue to apply upward pressure on pricing across major platforms.'

// [Placeholder] — swap with real articles from a news/search API
const PLACEHOLDER_ARTICLES = [
  {
    id: 1,
    source: 'Sneaker News',
    date: 'Dec 14, 2024',
    title: 'Air Max Resale Hits All-Time High Ahead of Holiday Season',
    snippet:
      'Secondary market platforms report record transaction volume as buyers scramble for limited colorways before year-end.',
    tag: 'MARKET',
    tagColor: '#38bdf8',
  },
  {
    id: 2,
    source: 'StockX Blog',
    date: 'Dec 10, 2024',
    title: "Nike's Q4 Drop Calendar Fuels Speculative Buying",
    snippet:
      'Analysts note a 22% spike in pre-release bids correlating with Nike\'s announced winter drop schedule.',
    tag: 'ANALYSIS',
    tagColor: '#818cf8',
  },
  {
    id: 3,
    source: 'Complex',
    date: 'Dec 7, 2024',
    title: 'The Best Air Max Deals Right Now',
    snippet:
      'We rounded up the lowest verified prices across GOAT, StockX, and Flight Club for every major 2024 colorway.',
    tag: 'DEALS',
    tagColor: '#34d399',
  },
  {
    id: 4,
    source: 'Hypebeast',
    date: 'Dec 3, 2024',
    title: 'How Algorithm Changes Are Reshaping Sneaker Flipping',
    snippet:
      'Platform fee updates on major resale apps are squeezing margins for casual sellers while pros adapt with bulk listings.',
    tag: 'TRENDS',
    tagColor: '#fb923c',
  },
  {
    id: 5,
    source: 'Sole Collector',
    date: 'Nov 28, 2024',
    title: "Black Friday Didn't Move the Needle on Resale",
    snippet:
      'Despite deep retail discounts, authenticated resale prices held firm — suggesting the collector floor is higher than expected.',
    tag: 'REPORT',
    tagColor: '#e879f9',
  },
]

// ─────────────────────────────────────────────
// COMPONENT: TrendGraph
//
// Draws a smooth SVG line chart from the price data.
// SVG coordinate system: (0,0) is TOP-LEFT.
// So higher prices = lower Y values (we flip the math).
// ─────────────────────────────────────────────
function titleCase(input: string) {
  return input
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function TrendGraph({ data }: { data: typeof PLACEHOLDER_PRICES }) {
  const W = 800  // viewBox width  (SVG "virtual pixels")
  const H = 220  // viewBox height
  const PAD = { top: 20, right: 20, bottom: 36, left: 48 }

  // Find min/max so we can normalize prices to fit the graph height
  // — same idea as finding the range in a dataset in Python/C
  const prices = data.map(d => d.price)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const range = maxP - minP || 1  // avoid divide-by-zero

  // Map a price value → a Y pixel position inside the chart area
  // High price → small Y (near top), low price → large Y (near bottom)
  const toY = (p: number) =>
    PAD.top + ((maxP - p) / range) * (H - PAD.top - PAD.bottom)

  // Map an index → an X pixel position
  const toX = (i: number) =>
    PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right)

  // Build SVG path string: "M x0,y0 C ... C ..." (cubic bezier curve)
  // This creates a smooth line rather than sharp zigzags
  const pathD = data.reduce((acc, d, i) => {
    const x = toX(i)
    const y = toY(d.price)
    if (i === 0) return `M ${x},${y}`
    // Control points for smooth bezier: pull horizontally from prev & next point
    const px = toX(i - 1)
    const py = toY(data[i - 1].price)
    const cpx = (px + x) / 2
    return `${acc} C ${cpx},${py} ${cpx},${y} ${x},${y}`
  }, '')

  // Area fill path: same line, then close down to the bottom
  const areaD = `${pathD} L ${toX(data.length - 1)},${H - PAD.bottom} L ${toX(0)},${H - PAD.bottom} Z`

  // Y-axis grid lines: 4 evenly spaced price labels
  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const price = minP + (range * i) / 3
    return { y: toY(price), label: `$${Math.round(price)}` }
  })

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"   // stretch to fill container width
      className="w-full h-full"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Gradient fill under the line */}
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
        </linearGradient>
        {/* Glow filter for the line */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Grid lines + Y-axis labels */}
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

      {/* X-axis month labels */}
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

      {/* Area fill */}
      <path d={areaD} fill="url(#areaGrad)" />

      {/* Main line */}
      <path
        d={pathD}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* Dot at the last (most recent) data point */}
      <circle
        cx={toX(data.length - 1)}
        cy={toY(data[data.length - 1].price)}
        r="5"
        fill="#38bdf8"
        filter="url(#glow)"
      />
      {/* Pulsing ring around the last dot */}
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
// COMPONENT: ArticleCard
// Vertical rectangle card for each article
// ─────────────────────────────────────────────
function ArticleCard({ article, index }: { article: typeof PLACEHOLDER_ARTICLES[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.5 + index * 0.08 }}
      className="flex flex-col rounded-2xl p-5 cursor-pointer backdrop-blur-md min-h-[220px]"
      style={{
        background: 'linear-gradient(160deg, rgba(15,23,42,0.97), rgba(15,23,42,0.8))',
        border: '1px solid rgba(56,189,248,0.12)',
        flex: '1 1 0',         // equal-width columns
        minWidth: '180px',
      }}
      whileHover={{
        borderColor: article.tagColor + '55',
        boxShadow: `0 0 28px ${article.tagColor}18, 0 8px 32px rgba(0,0,0,0.5)`,
        y: -3,
      }}
    >
      {/* Tag + date row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded-full"
          style={{
            background: article.tagColor + '18',
            color: article.tagColor,
            border: `1px solid ${article.tagColor}44`,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {article.tag}
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
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {/* [Placeholder] Replace with real article title */}
        {article.title}
      </h3>

      {/* Snippet */}
      <p
        className="text-slate-500 text-xs leading-relaxed"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {/* [Placeholder] Replace with real article excerpt */}
        {article.snippet}
      </p>

      {/* Read more link */}
      <div className="mt-4">
        <span
          className="text-[0.65rem] tracking-widest uppercase"
          style={{ color: article.tagColor, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {/* [???] Wire to real article URL */}
          Read More →
        </span>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT: Result
// ─────────────────────────────────────────────
export default function Result({ settings }: { settings: Settings }) {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const {
    animationMode,
    setAnimationMode,
    motionMode,
    setMotionMode,
    notifications,
    setNotifications,
  } = settings

  // Read the search query from the URL, e.g. /Result?q=Nike+Air+Max
  // [???] This will be used to fetch real data from your backend
  const [searchParams] = useSearchParams()
  const rawQuery = searchParams.get('q')?.trim() || ''
  const formattedQuery = rawQuery ? titleCase(rawQuery) : ''
  const displayQuery = formattedQuery || '[Placeholder Item]'
  const [searchText, setSearchText] = useState(formattedQuery)

  useEffect(() => {
    setSearchText(formattedQuery)
  }, [formattedQuery])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchText.trim()
    if (!trimmed) return
    navigate(`/Result?q=${encodeURIComponent(titleCase(trimmed))}`)
  }

  /* Dark/light mode toggle temporarily disabled
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode)
  }

  const pageBackground = darkMode ? '#060d1a' : '#f8fafc'
  const pageText = darkMode ? '#e2e8f0' : '#0f172a'
  */

  const isPositive = PLACEHOLDER_CHANGE_POSITIVE

  return (
    <div className="min-h-screen relative overflow-hidden font-sans" style={{ background: '#060d1a', color: '#e2e8f0' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');`}</style>

      <NavBar />
      <Setting onClick={() => setShowModal(true)} />

      {showModal && (
        <SettingsModal
          onClose={() => setShowModal(false)}
          darkMode={settings.darkMode} setDarkMode={settings.setDarkMode}
          animationMode={animationMode} setAnimationMode={setAnimationMode}
          motionMode={motionMode} setMotionMode={setMotionMode}
          notifications={notifications} setNotifications={setNotifications}
        />
      )}

      {/* ── Ambient glows ── */}
      <div className="fixed -top-28 -left-24 w-[500px] h-[500px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 65%)' }} />
      <div className="fixed -bottom-20 -right-20 w-[400px] h-[400px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)' }} />
      <div className="fixed inset-0 z-[1] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />

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

          {/* Dark mode toggle disabled
          <button
            onClick={handleDarkModeToggle}
            className="rounded-full px-4 py-2 border border-sky-400/20 text-sm text-white bg-sky-500/90 hover:bg-sky-400 transition"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
          */}

          <span className="text-xs text-slate-400 uppercase tracking-[0.3em] ml-auto"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            Result Settings
          </span>

          {/* Search bar — pre-filled with the current query */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3 flex-1 max-w-[520px]">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="flex-1 px-5 py-2.5 rounded-xl text-slate-200 text-[0.9rem] outline-none bg-slate-900/80"
              style={{ fontFamily: "'IBM Plex Mono', monospace", border: '1px solid rgba(56,189,248,0.25)' }}
              placeholder="Search anything..."
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer border-none"
              style={{ fontFamily: "'IBM Plex Mono', monospace", background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
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
            {/* [???] Replace with detected category from backend e.g. "CLOTHING / SNEAKERS" */}
            Results for: <span className="text-sky-400">{displayQuery}</span>
          </span>
        </motion.div>

        {/* ════════════════════════════════════════════
            BOX 1: Trend graph (4/5) + Price panel (1/5)
            Using CSS grid: 4fr for chart, 1fr for price
        ════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl overflow-hidden mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.85))',
            border: '1px solid rgba(56,189,248,0.15)',
            display: 'grid',
            gridTemplateColumns: '4fr 1fr',  // 4/5 chart, 1/5 price
          }}
        >
          {/* ── Left: Trend Graph ── */}
          <div className="p-6 border-r border-sky-400/10">
            {/* Chart header */}
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-slate-300 font-bold text-sm tracking-wide"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {/* [???] Replace with real item name from backend */}
                Price History — {displayQuery}
              </h2>
              {/* [???] Replace with real time-range toggle (1W / 1M / 6M / 1Y / All) */}
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

            {/* The SVG chart — [???] feed real price history here */}
            <div className="w-full" style={{ height: '200px' }}>
              <TrendGraph data={PLACEHOLDER_PRICES} />
            </div>
          </div>

          {/* ── Right: Average Price + Change ── */}
          <div className="p-6 flex flex-col justify-center items-start gap-3">
            {/* "Avg. Price" label */}
            <span
              className="text-[0.6rem] tracking-[0.2em] uppercase text-slate-600"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Avg. Price
            </span>

            {/* [$$$] — Replace with real average price */}
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

            {/* Divider */}
            <div className="w-full h-px bg-sky-400/10" />

            {/* Change label */}
            <span
              className="text-[0.6rem] tracking-[0.2em] uppercase text-slate-600"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              12-Month Change
            </span>

            {/* [$$$] — Replace with real change % from backend */}
            <div className="flex items-center gap-2">
              {/* Arrow icon: ▲ for positive, ▼ for negative */}
              <span style={{ color: isPositive ? '#10b981' : '#ef4444', fontSize: '0.75rem' }}>
                {isPositive ? '▲' : '▼'}
              </span>
              <span
                className="font-bold text-xl"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: isPositive ? '#10b981' : '#ef4444',
                  textShadow: isPositive ? '0 0 12px rgba(16,185,129,0.4)' : '0 0 12px rgba(239,68,68,0.4)',
                }}
              >
                {PLACEHOLDER_CHANGE}
              </span>
            </div>

            {/* [$$$] — Replace with real low/high range */}
            <div
              className="text-[0.65rem] text-slate-600 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <div>Low: <span className="text-slate-400">[$$$]</span></div>
              <div>High: <span className="text-slate-400">[$$$]</span></div>
              {/* [???] Add data source label here, e.g. "via StockX" */}
            </div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════
            BOX 2: Summary
            Full width — matches box above
        ════════════════════════════════════════════ */}
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
            {/* Section label */}
            <span
              className="text-[0.6rem] tracking-[0.25em] uppercase text-sky-400 border border-sky-400/30 px-3 py-0.5 rounded-full bg-sky-400/5"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Summary
            </span>
            {/* [???] Replace with detected item type badge e.g. CLOTHING, STOCK, CRYPTO */}
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

          {/* [???] Replace with real AI-generated or API summary */}
          <p
            className="text-slate-400 leading-relaxed text-sm max-w-4xl"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {PLACEHOLDER_SUMMARY}
          </p>

          {/* [$$$] — Optional: key facts row at the bottom of summary */}
          <div className="grid grid-cols-2 gap-4 mt-5 sm:grid-cols-4">
            {[
              { label: 'Retail Price',    value: '[$$$]' },
              { label: 'Avg Resale',      value: '[$$$]' },
              { label: 'Premium',         value: '[$$$]' },
              { label: 'Last Sale',       value: '[$$$]' },
            ].map(f => (
              <div key={f.label} className="rounded-xl p-3"
                style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.08)' }}>
                <div className="text-[0.6rem] text-slate-600 uppercase tracking-widest mb-1"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {f.label}
                </div>
                <div className="text-slate-300 font-bold text-base"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════
            BOX 3: Related Articles
            Horizontal row of vertical cards.
            "fill the width" = flex row, each card grows equally (flex: 1 1 0)
        ════════════════════════════════════════════ */}
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
            {/* [???] Replace with real article topic derived from query */}
            Related Articles
          </h2>
        </motion.div>

        {/* Article cards row — flex so they fill the width equally */}
        <div className="flex gap-3 pb-16" style={{ alignItems: 'stretch' }}>
          {/* [Placeholder] Replace PLACEHOLDER_ARTICLES with real articles from a news API */}
          {PLACEHOLDER_ARTICLES.map((article, i) => (
            <ArticleCard key={article.id} article={article} index={i} />
          ))}
        </div>

      </div>
    </div>
  )
}