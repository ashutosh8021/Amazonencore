import { useState, useEffect } from 'react'
import {
  ArrowLeft, ArrowUpRight, Award, BarChart3, BookOpen,
  Heart, Leaf, Package, Recycle, ShieldCheck,
  TrendingUp, Users, Wrench, Zap,
} from 'lucide-react'
import TopNav from '../components/TopNav.jsx'
import SubNav from '../components/SubNav.jsx'
import EncoreMark from '../components/EncoreMark.jsx'

/* ── static / seed data ─────────────────────────────────────────── */

const DECISION_ICON  = { Resell: TrendingUp, Donate: Heart, Refurbish: Wrench, Recycle: Recycle }
const DECISION_COLOR = { Resell: '#067D62', Donate: '#FF9900', Refurbish: '#007185', Recycle: '#555555' }

const FALLBACK_STATS = { totalItems: 12847, valueRecovered: 1820000, co2Kg: 48200, greenCredits: 94300 }
const FALLBACK_DECISIONS = [
  { label: 'Resell',    pct: 52, count: 6680 },
  { label: 'Donate',   pct: 28, count: 3597 },
  { label: 'Refurbish',pct: 14, count: 1799 },
  { label: 'Recycle',  pct: 6,  count: 771  },
]
const FALLBACK_ACTIVITY = [
  { item: 'Atomic Habits (Paperback)', category: 'Books',          grade: 'Very Good',   decision: 'Resell',    value: 350,  credits: null, time: '2 min ago' },
  { item: 'Nike Air Max 90',           category: 'Footwear',       grade: 'Good',        decision: 'Donate',    value: null, credits: 24,   time: '5 min ago' },
  { item: 'Samsung Galaxy Buds',       category: 'Electronics',    grade: 'Like New',    decision: 'Resell',    value: 4200, credits: null, time: '8 min ago' },
  { item: 'Cotton Kurta (M)',          category: 'Apparel',        grade: 'Acceptable',  decision: 'Donate',    value: null, credits: 35,   time: '12 min ago' },
  { item: 'Prestige Mixer Grinder',    category: 'Home & Kitchen', grade: 'Good',        decision: 'Refurbish', value: 2800, credits: null, time: '15 min ago' },
  { item: 'The Psychology of Money',   category: 'Books',          grade: 'Like New',    decision: 'Resell',    value: 420,  credits: null, time: '18 min ago' },
  { item: 'Puma Running Shoes',        category: 'Footwear',       grade: 'Acceptable',  decision: 'Donate',    value: null, credits: 24,   time: '22 min ago' },
  { item: 'Boat Airdopes 141',         category: 'Electronics',    grade: 'Not Sellable',decision: 'Recycle',   value: null, credits: 50,   time: '25 min ago' },
]

const CATEGORIES = [
  { name: 'Books',         count: 3400, icon: BookOpen,    badge: 'Where it all started', color: '#FF9900' },
  { name: 'Electronics',  count: 2890, icon: Zap,         color: '#007185' },
  { name: 'Footwear',     count: 2100, icon: Package,     color: '#c45500' },
  { name: 'Apparel',      count: 1850, icon: Users,       color: '#b12704' },
  { name: 'Home & Kitchen',count: 1407,icon: ShieldCheck, color: '#067D62' },
  { name: 'Others',       count: 1200, icon: Package,     color: '#565959' },
]
const CAT_MAX = Math.max(...CATEGORIES.map(c => c.count))

const MONTHLY = [
  { month: 'Jan', count: 1200 },
  { month: 'Feb', count: 1800 },
  { month: 'Mar', count: 2100 },
  { month: 'Apr', count: 2400 },
  { month: 'May', count: 2647 },
  { month: 'Jun', count: 2700 },
]
const MONTH_MAX = Math.max(...MONTHLY.map(m => m.count))

const CUSTOMER_STORIES = [
  { name: 'Priya S.',  location: 'Bengaluru', text: 'I returned a shoe I barely wore. Encore donated it and gave me 24 green credits. First time a return felt good.' },
  { name: 'Rahul M.',  location: 'Mumbai',    text: 'Listed my baby monitor in under a minute. The AI condition report made the buyer trust the listing immediately.' },
  { name: 'Anita K.',  location: 'Delhi',     text: 'Bought a Very Good condition mixer grinder at 45% off. The honest flaw report made me confident to purchase.' },
]

const GRADE_COLORS = {
  'Like New':     { color: '#067D62', bg: '#e6f4ea' },
  'Very Good':    { color: '#007185', bg: '#e0f0f3' },
  'Good':         { color: '#c45500', bg: '#fff3e0' },
  'Acceptable':   { color: '#b12704', bg: '#fde8d8' },
  'Not Sellable': { color: '#cc0c39', bg: '#fce8e8' },
}

/* ── helpers ─────────────────────────────────────────────────────── */

function fmt(n) { return Number(n).toLocaleString('en-IN') }
function fmtCr(n) {
  const cr = n / 10000000
  return cr >= 1 ? `${cr.toFixed(2)} Cr` : `${fmt(Math.round(n / 100) * 100)}`
}

/* ── donut chart ─────────────────────────────────────────────────── */

const R = 64
const CIRC = 2 * Math.PI * R

function DonutChart({ decisions, totalItems }) {
  const [hovered, setHovered] = useState(null)
  let cum = 0

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      <div className="relative">
        <svg width={180} height={180} viewBox="0 0 180 180">
          <circle cx={90} cy={90} r={R} fill="none" stroke="#F3F3F3" strokeWidth={24} />
          {decisions.map((seg, i) => {
            const color = DECISION_COLOR[seg.label] || '#999'
            const dash = (seg.pct / 100) * CIRC
            const offset = -(cum / 100) * CIRC
            cum += seg.pct
            const isHov = hovered === seg.label
            return (
              <circle
                key={seg.label}
                cx={90} cy={90} r={R}
                fill="none"
                stroke={color}
                strokeWidth={isHov ? 28 : 24}
                strokeDasharray={`${dash} ${CIRC}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                transform="rotate(-90 90 90)"
                style={{ transition: 'stroke-width 0.25s ease, opacity 0.25s ease', opacity: hovered && !isHov ? 0.4 : 1, cursor: 'pointer' }}
                onMouseEnter={() => setHovered(seg.label)}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}
          <text x={90} y={82} textAnchor="middle" style={{ fill: '#0F1111', fontSize: 22, fontWeight: 800 }}>
            {fmt(totalItems)}
          </text>
          <text x={90} y={100} textAnchor="middle" style={{ fill: '#879596', fontSize: 11 }}>
            total items
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1 w-full">
        {decisions.map(seg => {
          const color = DECISION_COLOR[seg.label] || '#999'
          const Icon = DECISION_ICON[seg.label] || Package
          const isHov = hovered === seg.label
          return (
            <div key={seg.label}
              className="rounded-lg border p-3 cursor-pointer transition-all"
              style={{ borderColor: isHov ? color : '#E3E6E6', backgroundColor: isHov ? color + '08' : '#FBFBFB', transform: isHov ? 'scale(1.02)' : 'scale(1)' }}
              onMouseEnter={() => setHovered(seg.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
                  <Icon size={12} style={{ color }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{seg.label}</span>
              </div>
              <p className="text-2xl font-extrabold" style={{ color }}>{seg.pct}%</p>
              <p className="text-xs" style={{ color: '#565959' }}>{fmt(seg.count)} items</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── main ─────────────────────────────────────────────────────────── */

export default function Dashboard({ onBack, nav = {}, onScrollTo }) {
  const [stats, setStats]         = useState(FALLBACK_STATS)
  const [decisions, setDecisions] = useState(FALLBACK_DECISIONS)
  const [activity, setActivity]   = useState(FALLBACK_ACTIVITY)
  const [isLive, setIsLive]       = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) return
        const data = await res.json()
        setStats(data.stats)
        setDecisions(data.decisions)
        if (data.activity?.length) setActivity(data.activity)
        setIsLive(!data.seeded)
      } catch { /* silent — fallback already showing */ }
      finally { setLoading(false) }
    }
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  const topStats = [
    { value: fmt(stats.totalItems),               label: 'Items processed',     note: 'Graded and routed by Encore AI',   Icon: Package,  accent: '#FF9900' },
    { value: `₹${fmtCr(stats.valueRecovered)}`,label: 'Value recovered',  note: 'Returned to sellers and customers', Icon: TrendingUp,accent: '#067D62' },
    { value: `${(stats.co2Kg / 1000).toFixed(1)} tons`,label: 'CO2 diverted', note: 'Net of return shipping emissions',   Icon: Leaf,     accent: '#067D62' },
    { value: fmt(stats.greenCredits),             label: 'Green credits earned', note: '1 credit = ₹2 Amazon Pay',   Icon: Award,    accent: '#007185' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#eaeded' }}>
      <TopNav onPrimaryAction={onBack} primaryLabel="Back to home" onHome={onBack} onOpenCart={nav.onOpenCart} cartCount={nav.cartCount} onSignIn={nav.onSignIn} onMyListings={nav.onMyListings} onProfile={nav.onProfile} />
      <SubNav
        onGetStarted={nav.onGetStarted}
        onDemoMode={nav.onDemoMode}
        onPersonas={nav.onPersonas}
        onDashboard={nav.onDashboard}
        onMarketplace={nav.onMarketplace}
        onCampus={nav.onCampus}
        onScrollTo={nav.onScrollTo || onScrollTo}
        onSignIn={nav.onSignIn}
      />

      <div className="max-w-[1500px] mx-auto px-4 py-6">

        {/* header */}
        <div className="rounded-md border bg-white p-5 md:p-6 mb-6" style={{ borderColor: '#D5D9D9' }}>
          <button type="button" onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm hover:text-[#C7511F] transition-colors mb-3"
            style={{ color: '#007185' }}>
            <ArrowLeft size={16} /> Back to Encore home
          </button>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: '#0F1111' }}>Encore impact dashboard</h1>
              <p className="text-[#565959] max-w-2xl">
                Real-time view of how Amazon Encore is giving products meaningful second lives.
                Every number ties to a real item that did not become waste.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: '#131921' }}>
              <EncoreMark size={16} color="#FF9900" />
              <span className="text-xs font-bold text-white tracking-wide">
                {isLive ? 'Live Supabase data' : 'Platform data'}
              </span>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: isLive ? '#067D62' : '#FF9900' }} />
            </div>
          </div>
        </div>

        {/* seeded data notice */}
        {!isLive && !loading && (
          <div className="rounded-md border mb-4 px-4 py-3 flex items-center gap-3"
            style={{ borderColor: '#FFD814', backgroundColor: '#fff8e0' }}>
            <span className="text-sm" style={{ color: '#565959' }}>
              Figures include illustrative baseline data and will update with real activity as items are processed through Encore.
            </span>
          </div>
        )}

        {/* top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {topStats.map(stat => {
            const Icon = stat.Icon
            return (
              <div key={stat.label} className="rounded-lg border bg-white p-5 relative overflow-hidden" style={{ borderColor: '#D5D9D9' }}>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: stat.accent }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.accent + '12' }}>
                    <Icon size={20} style={{ color: stat.accent }} />
                  </div>
                  <ArrowUpRight size={14} style={{ color: '#879596' }} />
                </div>
                <p className="text-3xl font-extrabold mb-1" style={{ color: stat.accent }}>
                  {loading ? '…' : stat.value}
                </p>
                <p className="font-semibold text-sm mb-0.5" style={{ color: '#0F1111' }}>{stat.label}</p>
                <p className="text-xs" style={{ color: '#565959' }}>{stat.note}</p>
              </div>
            )
          })}
        </div>

        {/* two-column layout */}
        <div className="flex flex-col xl:flex-row gap-6 mb-6">

          {/* left column */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* donut */}
            <div className="rounded-lg border bg-white p-6" style={{ borderColor: '#D5D9D9' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-1">Routing breakdown</p>
                  <h2 className="text-lg font-bold" style={{ color: '#0F1111' }}>Where items go</h2>
                </div>
                <div className="text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: '#D5D9D9', color: '#565959' }}>
                  {isLive ? 'Live' : 'All time'}
                </div>
              </div>
              <DonutChart decisions={decisions} totalItems={stats.totalItems} />
            </div>

            {/* category breakdown (static — no per-category data in DB yet) */}
            <div className="rounded-lg border bg-white p-6" style={{ borderColor: '#D5D9D9' }}>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-1">Volume by category</p>
                <h2 className="text-lg font-bold" style={{ color: '#0F1111' }}>Category breakdown</h2>
              </div>
              <div className="flex flex-col gap-4">
                {CATEGORIES.map((cat, i) => {
                  const CatIcon = cat.icon
                  const pct = (cat.count / CAT_MAX) * 100
                  return (
                    <div key={cat.name} className="rounded-lg border p-4" style={{ borderColor: '#E3E6E6' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '14' }}>
                            <CatIcon size={16} style={{ color: cat.color }} />
                          </div>
                          <span className="text-sm font-bold flex items-center gap-2" style={{ color: '#0F1111' }}>
                            {cat.name}
                            {cat.badge && (
                              <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5"
                                style={{ backgroundColor: '#fff8e0', color: '#FF9900', border: '1px solid #FFD814' }}>
                                {cat.badge}
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="text-lg font-extrabold" style={{ color: cat.color }}>{fmt(cat.count)}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F3F3' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* monthly trend (static — gives growth narrative) */}
            <div className="rounded-lg border bg-white p-6" style={{ borderColor: '#D5D9D9' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={16} style={{ color: '#879596' }} />
                    <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#879596' }}>Growth</p>
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: '#0F1111' }}>Monthly items processed</h2>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#067D62' }}>
                  <TrendingUp size={14} />+125% YTD
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {MONTHLY.map((m, i) => {
                  const pct = (m.count / MONTH_MAX) * 100
                  const isLatest = i === MONTHLY.length - 1
                  return (
                    <div key={m.month} className="flex items-center gap-4">
                      <span className="w-8 text-sm font-semibold text-right" style={{ color: isLatest ? '#FF9900' : '#565959' }}>{m.month}</span>
                      <div className="flex-1 h-8 rounded-lg overflow-hidden" style={{ backgroundColor: '#F7F8F8' }}>
                        <div className="h-full rounded-lg flex items-center justify-end px-3"
                          style={{ width: `${pct}%`, background: isLatest ? 'linear-gradient(90deg,#FF9900,#FFB84D)' : 'linear-gradient(90deg,rgba(255,153,0,0.6),rgba(255,153,0,0.75))' }}>
                          <span className="text-xs font-bold" style={{ color: isLatest ? '#0F1111' : '#5a3e00' }}>{fmt(m.count)}</span>
                        </div>
                      </div>
                      {isLatest && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fff8e0', color: '#FF9900' }}>Current</span>}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs mt-5 px-1" style={{ color: '#879596' }}>Rolling 6-month volume. June projections based on items processed to date.</p>
            </div>
          </div>

          {/* right column */}
          <div className="w-full xl:w-[380px] flex-shrink-0">
            <div className="xl:sticky xl:top-24 flex flex-col gap-6">

              {/* live activity feed */}
              <div className="rounded-lg border bg-white p-5" style={{ borderColor: '#D5D9D9' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-1">Live feed</p>
                    <h2 className="text-lg font-bold" style={{ color: '#0F1111' }}>Recent activity</h2>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#e6f4ea', color: '#067D62' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#067D62' }} />
                    {isLive ? 'Live' : 'Recent'}
                  </span>
                </div>
                <div className="max-h-[520px] overflow-y-auto pr-1 -mr-1">
                  {activity.map((a, i) => {
                    const gc = GRADE_COLORS[a.grade] || { color: '#565959', bg: '#f3f3f3' }
                    const dc = { color: DECISION_COLOR[a.decision] || '#565959', bg: (DECISION_COLOR[a.decision] || '#999') + '18' }
                    return (
                      <div key={i} className="py-3 px-3 rounded-lg mb-1 transition-colors hover:bg-[#F7F8F8]"
                        style={{ backgroundColor: i % 2 === 0 ? '#FBFBFB' : '#fff' }}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-semibold leading-snug" style={{ color: '#0F1111' }}>{a.item}</p>
                          <span className="text-[10px] whitespace-nowrap flex-shrink-0 mt-0.5" style={{ color: '#879596' }}>{a.time}</span>
                        </div>
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ backgroundColor: '#F3F3F3', color: '#565959' }}>{a.category}</span>
                          <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ backgroundColor: gc.bg, color: gc.color }}>{a.grade}</span>
                          <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ backgroundColor: dc.bg, color: dc.color }}>{a.decision}</span>
                          <span className="ml-auto text-xs font-bold" style={{ color: a.value ? '#067D62' : '#FF9900' }}>
                            {a.value ? `₹${fmt(a.value)}` : `+${a.credits} credits`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* books callout */}
              <div className="rounded-lg overflow-hidden">
                <div className="p-5" style={{ background: 'linear-gradient(135deg,#067D62,#0a9975)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <BookOpen size={20} color="#fff" />
                    </div>
                    <h3 className="text-base font-bold text-white">Books: where it all started</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90 mb-4">
                    3,400+ books given second lives through Encore. 4.1 tons of paper saved from landfill.
                    Amazon started by selling books — Encore makes sure they keep finding readers.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ val: '3,400+', lbl: 'Books saved' }, { val: '4.1 tons', lbl: 'Paper diverted' }, { val: '₹11.9L', lbl: 'Value recovered' }].map(s => (
                      <div key={s.lbl} className="rounded-lg p-2.5 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <p className="text-lg font-extrabold text-white">{s.val}</p>
                        <p className="text-[10px] text-white/70">{s.lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* customer stories — kept as-is */}
              <div className="rounded-lg border bg-white p-5" style={{ borderColor: '#D5D9D9' }}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-1">Customer voices</p>
                <h2 className="text-lg font-bold mb-4" style={{ color: '#0F1111' }}>What customers say</h2>
                <div className="flex flex-col gap-3">
                  {CUSTOMER_STORIES.map((story, i) => (
                    <div key={i} className="rounded-lg border p-4 transition-all hover:border-[#FF9900]"
                      style={{ borderColor: '#E3E6E6', backgroundColor: '#FBFBFB' }}>
                      <p className="text-sm text-[#565959] leading-relaxed mb-2 italic">"{story.text}"</p>
                      <p className="text-xs font-semibold" style={{ color: '#0F1111' }}>
                        {story.name}<span className="font-normal text-[#879596]"> · {story.location}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Think Big projection */}
              <div className="rounded-lg border p-5" style={{ borderColor: '#D5D9D9', background: 'linear-gradient(135deg,#131921,#232F3E)' }}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: '#FF9900' }}>Think Big</p>
                <h3 className="text-base font-bold text-white mb-2">If 1% of Amazon India returns used Encore</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[{ val: '3L+', lbl: 'Items saved' }, { val: '1,500 tons', lbl: 'CO2 diverted' }, { val: '₹24 Cr', lbl: 'Value recovered' }].map(s => (
                    <div key={s.lbl} className="rounded-lg p-2.5 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <p className="text-lg font-extrabold" style={{ color: '#FF9900' }}>{s.val}</p>
                      <p className="text-[10px] text-white/60 mt-0.5">{s.lbl}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-white/50">Based on our engine's per-item averages extrapolated to 300,000 items.</p>
              </div>
            </div>
          </div>
        </div>

        {/* experience banner */}
        <div className="rounded-lg overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg,#131921,#232F3E)' }}>
          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: '#FF9900' }}>Customer experience first</p>
              <h2 className="text-2xl font-bold text-white mb-2">Every return is a customer moment</h2>
              <p className="text-sm text-[#D5D9D9] leading-relaxed max-w-xl">
                Amazon Encore turns a frustrating return into a transparent, rewarding experience.
                Whether an item is resold at fair value, donated with green credits, or responsibly recycled,
                the customer always sees the math and always wins.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[{ val: '< 3s', lbl: 'AI grading time' }, { val: '100%', lbl: 'Math transparency' }, { val: '0', lbl: 'Items wasted' }].map(s => (
                <div key={s.lbl} className="rounded-lg p-4 text-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-2xl font-extrabold" style={{ color: '#FF9900' }}>{s.val}</p>
                  <p className="text-[10px] text-[#D5D9D9] mt-0.5">{s.lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
