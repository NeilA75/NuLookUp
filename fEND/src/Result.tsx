// ============================================================
// Result.tsx — Search Result Page for NuLookUp
// ============================================================

import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState, useRef, type FormEvent } from 'react'
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

interface TrendPoint {
  day: string
  price: number
}

interface SearchResult {
  query: string
  category: string
  avgPrice: string
  change: string
  changePositive: boolean
  low: string
  high: string
  trend: TrendPoint[]
  summary: string
  articles: RealArticle[]
}

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

function createThirtyDaySeries(data: TrendPoint[]): TrendPoint[] {
  if (data.length === 0) return []
  if (data.length === 1) {
    return Array.from({ length: 30 }, (_, index) => ({
      day: `D${index + 1}`,
      price: Number(data[0].price.toFixed(2)),
    }))
  }

  const prev = data[data.length - 2]
  const last = data[data.length - 1]
  const points: TrendPoint[] = []

  for (let i = 0; i < 30; i += 1) {
    const ratio = i / 29
    const price = prev.price + (last.price - prev.price) * ratio
    points.push({ day: `D${i + 1}`, price: Number(price.toFixed(2)) })
  }

  return points
}

function getTimeFilteredData(data: TrendPoint[], range: string): TrendPoint[] {
  if (range === '1M') return createThirtyDaySeries(data)
  if (range === '6M') return data.slice(-6)
  if (range === '1Y') return data
  return data // 'All'
}

// ─────────────────────────────────────────────
// COMPONENT: TrendGraph
// ─────────────────────────────────────────────

function TrendGraph({
  data,
  lockedIndex,
  onLockIndex,
}: {
  data: TrendPoint[]
  lockedIndex: number | null
  onLockIndex: (index: number | null) => void
}) {
  const W = 800
  const H = 220
  const PAD = { top: 20, right: 20, bottom: 36, left: 48 }
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; price: number; day: string; index: number } | null>(null)

  const prices = data.map((d) => d.price).filter((p) => Number.isFinite(p))
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const valueRange = Math.max(1, maxP - minP)

  const toY = (p: number) => PAD.top + ((maxP - p) / valueRange) * (H - PAD.top - PAD.bottom)
  const toX = (i: number) => (data.length <= 1 ? W / 2 : PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right))

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
    const price = minP + (valueRange * i) / 3
    return { y: toY(price), label: `$${Math.round(price)}` }
  })

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || data.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const relativeX = (mouseX / rect.width) * W

    if (relativeX < PAD.left || relativeX > W - PAD.right) {
      setHoverPoint(null)
      return
    }

    let closestIndex = 0
    let closestDist = Infinity
    for (let i = 0; i < data.length; i += 1) {
      const pointX = toX(i)
      const dist = Math.abs(pointX - relativeX)
      if (dist < closestDist) {
        closestDist = dist
        closestIndex = i
      }
    }

    const point = data[closestIndex]
    if (point) {
      setHoverPoint({
        x: toX(closestIndex),
        y: toY(point.price),
        price: point.price,
        day: point.day,
        index: closestIndex,
      })
    }
  }

  const handleSvgMouseLeave = () => {
    if (lockedIndex === null) setHoverPoint(null)
  }

  const handleClick = () => {
    if (hoverPoint) {
      const nextLock = hoverPoint.index === lockedIndex ? null : hoverPoint.index
      onLockIndex(nextLock)
    }
  }

  const activeIndex = lockedIndex ?? hoverPoint?.index
  const activePoint = activeIndex != null ? {
    x: toX(activeIndex),
    y: toY(data[activeIndex].price),
    price: data[activeIndex].price,
    day: data[activeIndex].day,
    index: activeIndex,
  } : null

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full h-full cursor-crosshair"
      style={{ overflow: 'visible' }}
      onMouseMove={handleSvgMouseMove}
      onMouseLeave={handleSvgMouseLeave}
      onClick={handleClick}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="rgba(56,189,248,0.08)" strokeWidth="1" strokeDasharray="4 4" />
          <text x={PAD.left - 8} y={t.y + 4} fill="rgba(148,163,184,0.5)" fontSize="10" textAnchor="end" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {t.label}
          </text>
        </g>
      ))}

      {data.map((d, i) => {
        const labelInterval = Math.max(1, Math.floor(data.length / 6))
        if (i % labelInterval !== 0 && i !== data.length - 1) return null
        return (
          <text
            key={i}
            x={toX(i)}
            y={H - PAD.bottom + 16}
            fill="rgba(148,163,184,0.4)"
            fontSize="9"
            textAnchor="middle"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {d.day}
          </text>
        )
      })}

      <path d={areaD} fill="url(#areaGrad)" />

      <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" />

      {/* Vertical crosshair line on hover/lock */}
      {activePoint && (
        <line x1={activePoint.x} y1={PAD.top} x2={activePoint.x} y2={H - PAD.bottom} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
      )}

      {/* Hover/lock circle and tooltip */}
      {activePoint && (
        <>
          <circle cx={activePoint.x} cy={activePoint.y} r="6" fill={lockedIndex !== null ? '#fbbf24' : '#38bdf8'} filter="url(#glow)" />
          <circle cx={activePoint.x} cy={activePoint.y} r="11" fill="none" stroke={lockedIndex !== null ? '#fbbf24' : '#38bdf8'} strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Tooltip background */}
          <rect x={activePoint.x - 55} y={activePoint.y - 40} width="110" height="32" rx="6" fill="rgba(15,23,42,0.95)" stroke={lockedIndex !== null ? '#fbbf24' : '#38bdf8'} strokeWidth="1" />

          {/* Day label */}
          <text x={activePoint.x} y={activePoint.y - 22} fill="#e2e8f0" fontSize="10" fontWeight="600" textAnchor="middle" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {activePoint.day}
          </text>

          {/* Price value */}
          <text x={activePoint.x} y={activePoint.y - 8} fill={lockedIndex !== null ? '#fbbf24' : '#38bdf8'} fontSize="11" fontWeight="700" textAnchor="middle" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            ${activePoint.price.toFixed(2)}
          </text>
        </>
      )}

      {/* Last point indicator */}
      <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1]?.price || 0)} r="5" fill="#38bdf8" filter="url(#glow)" />
      <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1]?.price || 0)} r="9" fill="none" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
    </svg>
  )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT: Result
// ─────────────────────────────────────────────

export default function Result({ settings }: { settings: Settings }) {
  const navigate = useNavigate()
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

  // Backend search result data
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Time range filter state
  const [timeRange, setTimeRange] = useState<'1M' | '6M' | '1Y' | 'All'>('1Y')

  // Hover/lock state for graph
  const [lockedIndex, setLockedIndex] = useState<number | null>(null)

  // Fetch search result from backend
  useEffect(() => {
    async function fetchSearchResult() {
      if (!formattedQuery) return

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(formattedQuery)}`)
        if (!response.ok) throw new Error('Failed to fetch search result')
        const data: SearchResult = await response.json()
        setSearchResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setSearchResult(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResult()
  }, [formattedQuery])

  useEffect(() => {
    setSearchText(formattedQuery)
  }, [formattedQuery])

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchText.trim()
    if (!trimmed) return

    navigate(`/Result?q=${encodeURIComponent(titleCase(trimmed))}`)
  }

  // Get filtered trend data based on selected time range
  const filteredTrend = searchResult ? getTimeFilteredData(searchResult.trend, timeRange) : []
  const isPositive = searchResult?.changePositive ?? false

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

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#94a3b8' }}>
              Loading search results...
            </p>
          </motion.div>
        )}

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#ef4444' }}>
              {error}
            </p>
          </motion.div>
        )}

        {/* Content */}
        {!loading && !error && searchResult && (
          <>
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
                    {(['1M', '6M', '1Y', 'All'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setTimeRange(range)
                          setLockedIndex(null)
                        }}
                        className="text-[0.6rem] tracking-widest px-2.5 py-1 rounded-lg border-none cursor-pointer transition-colors"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          background: range === timeRange ? 'rgba(56,189,248,0.15)' : 'transparent',
                          color: range === timeRange ? '#38bdf8' : 'rgba(148,163,184,0.4)',
                          border: range === timeRange ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
                        }}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-full" style={{ height: '200px' }}>
                  <TrendGraph data={filteredTrend} lockedIndex={lockedIndex} onLockIndex={setLockedIndex} />
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
                  {searchResult.avgPrice}
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
                    {searchResult.change}
                  </span>
                </div>

                <div
                  className="text-[0.65rem] text-slate-600 leading-relaxed"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  <div>Low: <span className="text-slate-400">{searchResult.low}</span></div>
                  <div>High: <span className="text-slate-400">{searchResult.high}</span></div>
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
                  {searchResult.category} Category
                </span>
              </div>

              <p
                className="text-slate-400 leading-relaxed text-sm max-w-4xl"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {searchResult.summary}
              </p>
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
              {searchResult.articles.length > 0 && (
                <span
                  className="text-[0.6rem] text-slate-700 ml-1"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  ({searchResult.articles.length})
                </span>
              )}
            </motion.div>

            {/* Article cards row */}
            <div className="flex gap-3 pb-16 overflow-x-auto" style={{ alignItems: 'stretch' }}>
              {searchResult.articles.length > 0 ? (
                searchResult.articles.map((article, i) => {
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
                        minWidth: '280px',
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
                          WebkitLineClamp: 3,
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
                          WebkitLineClamp: 3,
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
          </>
        )}

      </div>
    </div>
  )
}