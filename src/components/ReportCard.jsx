import {
  AlertTriangle, Award, CheckCircle2, Clock, Cpu, Leaf,
  ShieldCheck, TreePine, XCircle,
} from 'lucide-react'
import EncoreMark from './EncoreMark.jsx'

/* ── colour configs (mirrored from Intake for consistency) ────────── */

const GRADE_CFG = {
  'Like New':     { color: '#067D62', bg: '#e6f4ea' },
  'Very Good':    { color: '#007185', bg: '#e0f0f3' },
  'Good':         { color: '#c45500', bg: '#fff3e0' },
  'Acceptable':   { color: '#b12704', bg: '#fde8d8' },
  'Not Sellable': { color: '#cc0c39', bg: '#fce8e8' },
}

const GRADE_ORDER = ['Like New', 'Very Good', 'Good', 'Acceptable', 'Not Sellable']

const DECISION_CFG = {
  'Resell':    { color: '#067D62', bg: '#e6f4ea', label: 'Listed for resale' },
  'Refurbish': { color: '#007185', bg: '#e0f0f3', label: 'Queued for refurbishment' },
  'Donate':    { color: '#FF9900', bg: '#fff8e0', label: 'Routed to donation' },
  'Recycle':   { color: '#555555', bg: '#f3f3f3', label: 'Sent to responsible recycling' },
}

/* ── helpers ──────────────────────────────────────────────────────── */

function formatCurrency(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`
}

function classifyObs(text) {
  const t = text.toLowerCase()
  if (/tear|broken|heavy|damaged|missing/.test(t)) return 'flaw'
  if (/minor|slight|small/.test(t)) return 'minor'
  if (/intact|pristine|excellent|functional|clean|\bno\b/.test(t)) return 'positive'
  return 'minor' // default to neutral-ish
}

const OBS_ICON = {
  positive: { Icon: CheckCircle2, color: '#067D62' },
  minor:    { Icon: AlertTriangle, color: '#c45500' },
  flaw:     { Icon: XCircle,       color: '#cc0c39' },
}

/* ── confidence ring (pure SVG) ───────────────────────────────────── */

function ConfidenceRing({ value, size = 72 }) {
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="#E3E6E6" strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="#067D62" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
      <text
        x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        style={{ fontSize: 16, fontWeight: 700, fill: '#0F1111' }}
      >
        {value}%
      </text>
    </svg>
  )
}

/* ── grade scale bar ──────────────────────────────────────────────── */

function GradeScaleBar({ currentGrade }) {
  return (
    <div className="flex items-center gap-0 w-full">
      {GRADE_ORDER.map((g) => {
        const cfg = GRADE_CFG[g]
        const isActive = g === currentGrade
        return (
          <div key={g} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-2 rounded-sm"
              style={{
                backgroundColor: isActive ? cfg.color : '#E3E6E6',
                opacity: isActive ? 1 : 0.45,
              }}
            />
            {isActive && (
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderBottom: `6px solid ${cfg.color}`,
                  transform: 'rotate(180deg)',
                }}
              />
            )}
            <span
              className="text-[10px] font-semibold text-center leading-tight"
              style={{ color: isActive ? cfg.color : '#879596' }}
            >
              {g}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  ReportCard                                                        */
/* ═══════════════════════════════════════════════════════════════════ */

export default function ReportCard({
  gradeResult,
  decideResult,
  listingResult,
  productName,
  originalPrice,
  category,
  imageUrl,
}) {
  const gradeCfg = GRADE_CFG[gradeResult.grade] ?? GRADE_CFG['Acceptable']
  const decCfg   = DECISION_CFG[decideResult.decision] ?? DECISION_CFG['Donate']
  const net      = decideResult.netResell
  const isLoss   = net < 0
  const co2      = gradeResult.co2SavedKgEstimate ?? 0
  const trees    = Math.ceil(co2 / 22)
  const now      = new Date()
  const dateStr  = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr  = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const resalePct = originalPrice > 0
    ? Math.round((decideResult.expectedResaleValue / originalPrice) * 100)
    : 0

  return (
    <div
      className="rounded-md border bg-white max-w-3xl mx-auto"
      style={{ borderColor: '#D5D9D9' }}
    >
      {/* ── 1. Header ──────────────────────────────────────────── */}
      <div
        className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ borderBottom: '2px solid #FF9900' }}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <EncoreMark size={28} color="#FF9900" />
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#0F1111' }}>
              Amazon Encore Condition Report
            </h2>
            <div className="flex items-center gap-3 flex-wrap mt-0.5">
              <span className="text-xs text-[#565959] flex items-center gap-1">
                <Clock size={12} /> {dateStr}
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ backgroundColor: '#e6f4ea', color: '#067D62' }}
              >
                <ShieldCheck size={12} /> Encore Verified
              </span>
            </div>
          </div>
        </div>

        {imageUrl && (
          <img
            src={imageUrl}
            alt={productName}
            className="w-16 h-16 rounded-md object-cover border"
            style={{ borderColor: '#D5D9D9' }}
          />
        )}
      </div>

      {/* Product name + category */}
      <div className="px-6 pt-4 pb-2">
        <p className="text-base font-bold" style={{ color: '#0F1111' }}>
          {productName || gradeResult.product}
        </p>
        <p className="text-sm text-[#565959]">
          {category || gradeResult.category}
          {originalPrice > 0 && <> · Original price {formatCurrency(originalPrice)}</>}
        </p>
      </div>

      {/* ── 2. Condition Grade ─────────────────────────────────── */}
      <div className="px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-3">
          Condition grade
        </p>

        <div className="flex items-center gap-5 flex-wrap mb-4">
          <span
            className="text-lg font-bold px-4 py-1.5 rounded-full"
            style={{ backgroundColor: gradeCfg.bg, color: gradeCfg.color }}
          >
            {gradeResult.grade}
          </span>

          <div className="flex flex-col items-center">
            <ConfidenceRing value={gradeResult.confidence} />
            <span className="text-[10px] text-[#879596] mt-1">Confidence</span>
          </div>
        </div>

        <GradeScaleBar currentGrade={gradeResult.grade} />
      </div>

      <hr style={{ borderColor: '#E3E6E6' }} />

      {/* ── 3. Detailed Observations ───────────────────────────── */}
      {gradeResult.observations?.length > 0 && (
        <div className="px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-3">
            Detailed observations
          </p>
          <div className="space-y-2">
            {gradeResult.observations.map((obs, i) => {
              const kind = classifyObs(obs)
              const { Icon, color } = OBS_ICON[kind]
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-md border px-3 py-2.5"
                  style={{ borderColor: '#E3E6E6', backgroundColor: '#FBFBFB' }}
                >
                  <Icon size={16} className="mt-0.5 flex-shrink-0" style={{ color }} />
                  <span className="text-sm" style={{ color: '#0F1111' }}>{obs}</span>
                </div>
              )
            })}
          </div>

          {gradeResult.conditionReport && (
            <div
              className="rounded-md border mt-3 p-3"
              style={{ borderColor: '#D5D9D9', backgroundColor: '#F7F8F8' }}
            >
              <p className="text-xs text-[#879596] font-semibold mb-1">Condition summary</p>
              <p className="text-sm text-[#565959] leading-relaxed">{gradeResult.conditionReport}</p>
            </div>
          )}
        </div>
      )}

      <hr style={{ borderColor: '#E3E6E6' }} />

      {/* ── 4. Decision Math ───────────────────────────────────── */}
      <div className="px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-3">
          Value-versus-cost breakdown
        </p>

        <div
          className="rounded-md border p-4"
          style={{ borderColor: '#D5D9D9', backgroundColor: '#FBFBFB' }}
        >
          {/* Row: expected resale value */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[#565959]">
              Expected resale value
              {resalePct > 0 && (
                <span className="text-xs text-[#879596] ml-1">({resalePct}% of original)</span>
              )}
            </span>
            <span className="text-sm font-semibold" style={{ color: '#0F1111' }}>
              {formatCurrency(decideResult.expectedResaleValue)}
            </span>
          </div>

          {/* Row: processing cost */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[#565959]">Processing cost</span>
            <span className="text-sm font-semibold" style={{ color: '#b12704' }}>
              −{formatCurrency(decideResult.processingCost)}
            </span>
          </div>

          {/* Divider */}
          <hr className="my-2" style={{ borderColor: '#D5D9D9' }} />

          {/* Row: net resell */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-bold" style={{ color: '#0F1111' }}>Net resell value</span>
            <span
              className="text-xl font-extrabold"
              style={{ color: isLoss ? '#cc0c39' : '#067D62' }}
            >
              {isLoss ? `−${formatCurrency(Math.abs(net))}` : formatCurrency(net)}
            </span>
          </div>

          <p className="text-xs text-[#879596] mt-1">
            {formatCurrency(decideResult.expectedResaleValue)} − {formatCurrency(decideResult.processingCost)} ={' '}
            <strong style={{ color: isLoss ? '#cc0c39' : '#067D62' }}>
              {isLoss ? `−${formatCurrency(Math.abs(net))}` : formatCurrency(net)}
            </strong>
          </p>
        </div>

        {/* Decision badge */}
        <div
          className="rounded-md px-4 py-3 mt-4 flex items-center gap-3"
          style={{ backgroundColor: decCfg.bg }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: decCfg.color + '1A' }}
          >
            <ShieldCheck size={20} style={{ color: decCfg.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: decCfg.color }}>
              Encore decision
            </p>
            <span className="text-2xl font-extrabold" style={{ color: decCfg.color }}>
              {decideResult.decision}
            </span>
          </div>
          <span className="text-xs font-semibold hidden sm:block" style={{ color: decCfg.color }}>
            {decCfg.label}
          </span>
        </div>

        {decideResult.reason && (
          <p className="text-sm text-[#565959] mt-3 leading-relaxed">{decideResult.reason}</p>
        )}
      </div>

      <hr style={{ borderColor: '#E3E6E6' }} />

      {/* ── 5. Environmental Impact ────────────────────────────── */}
      <div className="px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-3">
          Environmental impact
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div
            className="rounded-md border p-3 flex items-center gap-3"
            style={{ borderColor: '#D5D9D9', backgroundColor: '#e6f4ea' }}
          >
            <Leaf size={20} style={{ color: '#067D62' }} />
            <div>
              <p className="text-xl font-extrabold" style={{ color: '#067D62' }}>{co2} kg</p>
              <p className="text-xs text-[#565959]">CO2 saved</p>
            </div>
          </div>

          <div
            className="rounded-md border p-3 flex items-center gap-3"
            style={{ borderColor: '#D5D9D9', backgroundColor: '#fff8e0' }}
          >
            <Award size={20} style={{ color: '#FF9900' }} />
            <div>
              <p className="text-xl font-extrabold" style={{ color: '#FF9900' }}>
                +{decideResult.greenCredits}
              </p>
              <p className="text-xs text-[#565959]">Green credits</p>
            </div>
          </div>

          <div
            className="rounded-md border p-3 flex items-center gap-3"
            style={{ borderColor: '#D5D9D9', backgroundColor: '#F7F8F8' }}
          >
            <TreePine size={20} style={{ color: '#067D62' }} />
            <div>
              <p className="text-xl font-extrabold" style={{ color: '#067D62' }}>
                {trees}
              </p>
              <p className="text-xs text-[#565959]">
                {trees === 1 ? 'Tree equivalent' : 'Trees equivalent'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ borderColor: '#E3E6E6' }} />

      {/* ── 6. Customer Value ──────────────────────────────────── */}
      <div className="px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-3">
          What happens next
        </p>

        {decideResult.decision === 'Resell' && listingResult && (
          <div
            className="rounded-md border p-4"
            style={{ borderColor: '#D5D9D9', backgroundColor: '#FBFBFB' }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: '#067D62' }}>
              Your item will be listed on Amazon Encore marketplace
            </p>
            <h3 className="font-bold text-base leading-snug" style={{ color: '#007185' }}>
              {listingResult.title}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mt-1.5">
              {listingResult.description}
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#e0f0f3', color: '#007185' }}
              >
                {listingResult.conditionLabel}
              </span>
              {listingResult.suggestedPrice && (
                <span className="text-xl font-bold" style={{ color: '#0F1111' }}>
                  {formatCurrency(listingResult.suggestedPrice)}
                </span>
              )}
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full ml-auto"
                style={{ backgroundColor: '#e6f4ea', color: '#067D62' }}
              >
                Encore Verified
              </span>
            </div>
          </div>
        )}

        {decideResult.decision === 'Donate' && (
          <div className="rounded-md p-4" style={{ backgroundColor: '#fff8e0' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: '#0F1111' }}>
              Your item will help someone who needs it
            </p>
            <p className="text-sm text-[#565959] leading-relaxed">
              Rather than relisting at a loss, we route this item to a verified donation partner.
              You earn <strong style={{ color: '#FF9900' }}>{decideResult.greenCredits} green credits</strong> redeemable
              on any future Amazon order.
            </p>
          </div>
        )}

        {decideResult.decision === 'Refurbish' && (
          <div className="rounded-md p-4" style={{ backgroundColor: '#e0f0f3' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: '#007185' }}>
              Your item will be refurbished to a sellable condition
            </p>
            <p className="text-sm text-[#565959] leading-relaxed">
              Our certified refurbishment partner will restore this item before listing it on the
              Encore marketplace with a full condition disclosure.
            </p>
          </div>
        )}

        {decideResult.decision === 'Recycle' && (
          <div className="rounded-md p-4" style={{ backgroundColor: '#f3f3f3' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: '#555555' }}>
              Raw materials will be recovered responsibly
            </p>
            <p className="text-sm text-[#565959] leading-relaxed">
              This item will be sent to a certified recycler who recovers usable materials and
              ensures responsible disposal of the rest. You earn{' '}
              <strong>{decideResult.greenCredits} green credits</strong> for choosing sustainability.
            </p>
          </div>
        )}
      </div>

      {/* ── 7. Footer ──────────────────────────────────────────── */}
      <div
        className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2"
        style={{ backgroundColor: '#F7F8F8', borderTop: '1px solid #E3E6E6' }}
      >
        <div className="flex items-center gap-2 text-xs text-[#879596]">
          <Cpu size={14} />
          <span>Powered by Amazon Bedrock</span>
          <span className="hidden sm:inline">·</span>
          <span>{dateStr} at {timeStr}</span>
        </div>
        <p className="text-[11px] text-[#879596] sm:ml-auto max-w-xs text-right leading-snug">
          This report is generated by AI. Condition grades are estimates and may vary from in-person inspection.
        </p>
      </div>
    </div>
  )
}
