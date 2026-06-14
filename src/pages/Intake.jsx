import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle, AlertTriangle, ArrowLeft, Award, CheckCircle2, Heart, Leaf, Loader2, RotateCcw,
  ShieldCheck, Shirt, Smartphone, TrendingUp, Upload, Wrench, X, Zap,
} from 'lucide-react'
import TopNav from '../components/TopNav.jsx'
import SubNav from '../components/SubNav.jsx'
import ReportCard from '../components/ReportCard.jsx'
import ListingPreview from '../components/ListingPreview.jsx'
import { gradeImage, decide, generateListing, healthCheck, API_BASE_URL } from '../lib/api.js'

const CATEGORIES = [
  'Electronics', 'Footwear', 'Apparel', 'Home & Kitchen',
  'Books', 'Toys', 'Sports', 'Beauty', 'Automotive',
]

const GRADE_CFG = {
  'Like New':     { color: '#067D62', bg: '#e6f4ea' },
  'Very Good':    { color: '#007185', bg: '#e0f0f3' },
  'Good':         { color: '#c45500', bg: '#fff3e0' },
  'Acceptable':   { color: '#b12704', bg: '#fde8d8' },
  'Not Sellable': { color: '#cc0c39', bg: '#fce8e8' },
}

const DECISION_CFG = {
  'Resell':    { color: '#067D62', bg: '#e6f4ea', Icon: TrendingUp, label: 'Listed for sale' },
  'Refurbish': { color: '#007185', bg: '#e0f0f3', Icon: Wrench,     label: 'Prepared for refurbishment' },
  'Donate':    { color: '#FF9900', bg: '#fff8e0', Icon: Heart,       label: 'Routed to donation' },
  'Recycle':   { color: '#555555', bg: '#f3f3f3', Icon: Leaf,        label: 'Sent to responsible recycling' },
}

const FLOW_STEPS = [
  'Upload photo',
  'AI condition grade',
  'Decision math',
  'Listing or green credits',
]

const CATEGORY_HINTS = [
  { Icon: Zap,        label: 'Gadget' },
  { Icon: Shirt,      label: 'Apparel' },
  { Icon: Smartphone, label: 'Phone' },
]

const DEMO_CONFIG = {
  name: 'Running shoe (used)',
  price: 500,
  category: 'Footwear',
  previewUrl: 'https://picsum.photos/seed/encore-shoe-demo/600/600',
}

const DEMO_FALLBACK = {
  grade: {
    product: 'Running shoe',
    category: 'Footwear',
    grade: 'Good',
    confidence: 82,
    observations: ['Sole shows wear at heel', 'Minor scuffs on toe cap', 'Laces intact'],
    conditionReport: 'Gently used running shoe with visible wear on the sole and minor cosmetic scuffs. Functionally intact and suitable for casual use.',
    co2SavedKgEstimate: 2.4,
  },
  decide: {
    decision: 'Donate',
    expectedResaleValue: 200,
    processingCost: 250,
    netResell: -50,
    greenCredits: 24,
    reason: 'Relisting recovers ₹200 but costs ₹250 — a ₹50 loss. Donating earns more real-world value and 24 green credits.',
  },
  listing: null,
}

let demoCache = null

function formatCurrency(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`
}

function Stepper({ currentStep }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {FLOW_STEPS.map((step, index) => {
        const stepNumber = index + 1
        const isComplete = currentStep > stepNumber
        const isActive = currentStep === stepNumber

        return (
          <div
            key={step}
            className="rounded-md border px-4 py-3"
            style={{
              borderColor: isActive || isComplete ? '#FF9900' : '#D5D9D9',
              backgroundColor: isActive ? '#fff8e0' : 'white',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: isComplete ? '#067D62' : isActive ? '#FF9900' : '#E3E6E6',
                  color: isComplete || isActive ? 'white' : '#565959',
                }}
              >
                {isComplete ? <CheckCircle2 size={14} /> : stepNumber}
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596]">
                Step {stepNumber}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#0F1111]">{step}</p>
          </div>
        )
      })}
    </div>
  )
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function ConfidenceBar({ value }) {
  const color = value >= 75 ? '#067D62' : value >= 50 ? '#FF9900' : '#cc0c39'
  const label = value >= 75 ? 'High' : value >= 50 ? 'Medium' : 'Low'
  return (
    <div className="flex-1 min-w-[160px]">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[#565959] font-medium">AI confidence · {label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E3E6E6' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function GradeCard({ result }) {
  const cfg = GRADE_CFG[result.grade] ?? GRADE_CFG['Acceptable']
  const isLowConfidence = result.confidence < 60
  return (
    <div
      className="rounded-md border p-5 flex flex-col gap-4"
      style={{
        borderColor: isLowConfidence ? '#F59E0B' : '#D5D9D9',
        backgroundColor: isLowConfidence ? '#FFFBEB' : 'white',
      }}
    >
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} style={{ color: cfg.color }} />
        <span className="font-bold text-base" style={{ color: '#0F1111' }}>AI condition grade</span>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <span
          className="text-base font-bold px-3 py-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
          {result.grade}
        </span>
        <ConfidenceBar value={result.confidence} />
        {result.category && (
          <span className="text-sm text-[#565959] flex-shrink-0">Category: {result.category}</span>
        )}
      </div>

      {isLowConfidence && (
        <div className="flex items-start gap-2 rounded-md p-3" style={{ backgroundColor: '#FEF3C7' }}>
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
          <span className="text-sm" style={{ color: '#92400E' }}>
            Low confidence result. Try uploading a clearer photo or adding product details for a better assessment.
          </span>
        </div>
      )}

      <div className="rounded-md border bg-[#F7F8F8] p-4" style={{ borderColor: '#D5D9D9' }}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-2">
          Condition report
        </p>
        <p className="text-sm text-[#565959] leading-relaxed">{result.conditionReport}</p>
      </div>

      {result.observations?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {result.observations.map((obs, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full border"
              style={{ borderColor: '#D5D9D9', color: '#555', backgroundColor: '#fafafa' }}
            >
              {obs}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function DecisionCard({ result }) {
  const cfg = DECISION_CFG[result.decision] ?? DECISION_CFG['Donate']
  const { Icon } = cfg
  const net = result.netResell
  const isLoss = net < 0

  return (
    <div className="rounded-md border bg-white p-5 flex flex-col gap-4" style={{ borderColor: '#D5D9D9' }}>
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: cfg.color }} />
        <span className="font-bold text-base" style={{ color: '#0F1111' }}>Routing decision</span>
      </div>

      <div
        className="rounded-md px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: cfg.bg }}
      >
        <Icon size={22} style={{ color: cfg.color }} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: cfg.color }}>
            Encore outcome
          </p>
          <span className="text-2xl font-extrabold" style={{ color: cfg.color }}>
            {result.decision}
          </span>
        </div>
        <span className="ml-auto text-sm font-semibold" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      </div>

      <div className="rounded-md border p-4" style={{ borderColor: '#D5D9D9', backgroundColor: '#fafafa' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">The math</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-white border p-3 text-center" style={{ borderColor: '#E3E6E6' }}>
            <p className="text-xs text-[#879596] mb-1">Expected resale value</p>
            <p className="font-bold text-xl text-[#0F1111]">{formatCurrency(result.expectedResaleValue)}</p>
          </div>
          <div className="rounded-md bg-white border p-3 text-center" style={{ borderColor: '#E3E6E6' }}>
            <p className="text-xs text-[#879596] mb-1">Processing cost</p>
            <p className="font-bold text-xl text-[#0F1111]">{formatCurrency(result.processingCost)}</p>
          </div>
          <div className="rounded-md bg-white border p-3 text-center" style={{ borderColor: '#E3E6E6' }}>
            <p className="text-xs text-[#879596] mb-1">Net resell</p>
            <p
              className="font-extrabold text-2xl"
              style={{ color: isLoss ? '#cc0c39' : '#067D62' }}
            >
              {isLoss ? `−${formatCurrency(Math.abs(net))}` : formatCurrency(net)}
            </p>
          </div>
        </div>
        <p className="text-sm text-[#565959] mt-4">
          {formatCurrency(result.expectedResaleValue)} − {formatCurrency(result.processingCost)} ={' '}
          <strong style={{ color: isLoss ? '#cc0c39' : '#067D62' }}>
            {isLoss ? `−${formatCurrency(Math.abs(net))}` : formatCurrency(net)}
          </strong>
        </p>
      </div>

      <p className="text-sm text-[#565959] leading-relaxed">{result.reason}</p>
    </div>
  )
}

function GreenCreditsCard({ greenCredits, netCarbonSavedKg }) {
  const rupees = greenCredits * 2
  return (
    <div
      className="rounded-md border p-4 flex items-center gap-4"
      style={{ borderColor: '#B2DFDB', backgroundColor: '#f0faf5' }}
    >
      <div
        className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#067D62' }}
      >
        <Leaf size={20} style={{ color: 'white' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-0.5">
          Green credits earned
        </p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-extrabold" style={{ color: '#067D62' }}>
            +{greenCredits}
          </span>
          <span className="text-sm text-[#565959]">
            ≈ <strong style={{ color: '#0F1111' }}>₹{rupees} Amazon Pay</strong>
            {netCarbonSavedKg != null ? ` · ${netCarbonSavedKg.toFixed(1)} kg CO2 saved (net of return shipping)` : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

function LowConfidenceCard({ confidence, onReset }) {
  return (
    <div className="rounded-md border bg-white p-5 flex flex-col gap-4" style={{ borderColor: '#fecaca' }}>
      <div className="flex items-center gap-2">
        <AlertCircle size={16} style={{ color: '#cc0c39' }} />
        <span className="font-bold text-base" style={{ color: '#0F1111' }}>Clearer photo needed</span>
      </div>
      <div className="rounded-md p-4" style={{ backgroundColor: '#fce8e8' }}>
        <p className="text-sm font-semibold mb-2" style={{ color: '#cc0c39' }}>
          AI confidence: {confidence}% — below the 50% threshold to route safely
        </p>
        <p className="text-sm text-[#565959] leading-relaxed">
          Try again with a well-lit, in-focus photo showing the item clearly against a plain background.
          The item should fill most of the frame.
        </p>
      </div>
      <ConfidenceBar value={confidence} />
      <button
        type="button"
        onClick={onReset}
        style={{ backgroundColor: '#FFD814', color: '#0F1111' }}
        className="w-full py-3 rounded-full font-bold text-base hover:brightness-95 transition-all"
      >
        Upload a clearer photo
      </button>
    </div>
  )
}

function RewardCard({ listing, decideResult }) {
  if (listing) {
    return (
      <div className="rounded-md border bg-white p-5 flex flex-col gap-4" style={{ borderColor: '#D5D9D9' }}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} style={{ color: '#067D62' }} />
          <span className="font-bold text-base" style={{ color: '#0F1111' }}>Generated listing</span>
          <span
            className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#e6f4ea', color: '#067D62' }}
          >
            Encore Verified
          </span>
        </div>
        <div className="rounded-md border bg-[#FBFBFB] p-4" style={{ borderColor: '#D5D9D9' }}>
          <h3 className="font-bold text-lg leading-snug" style={{ color: '#007185' }}>
            {listing.title}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed mt-2">{listing.description}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#e0f0f3', color: '#007185' }}
          >
            {listing.conditionLabel}
          </span>
          {listing.suggestedPrice && (
            <span className="text-xl font-bold" style={{ color: '#0F1111' }}>
              ₹{Number(listing.suggestedPrice).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    )
  }

  const isDonate = decideResult.decision === 'Donate'
  return (
    <div className="rounded-md border bg-white p-5 flex flex-col gap-4" style={{ borderColor: '#D5D9D9' }}>
      <div className="flex items-center gap-2">
        <Heart size={16} style={{ color: '#FF9900' }} />
        <span className="font-bold text-base" style={{ color: '#0F1111' }}>
          {isDonate ? 'Donation outcome' : 'Recycling outcome'}
        </span>
      </div>
      <div className="rounded-md p-4" style={{ backgroundColor: '#fff8e0' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: '#0F1111' }}>
          We chose not to relist — here is why
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Relisting would recover {formatCurrency(decideResult.expectedResaleValue)} but costs{' '}
          {formatCurrency(decideResult.processingCost)}, a net loss of{' '}
          {formatCurrency(Math.abs(decideResult.netResell))}.{' '}
          {isDonate
            ? 'Donating this item benefits someone who needs it and earns you green credits.'
            : 'Responsible recycling recovers the raw materials.'}
        </p>
      </div>
      <div className="rounded-md p-4 flex items-center gap-4" style={{ backgroundColor: '#e6f4ea' }}>
        <div className="flex-shrink-0">
          <p className="text-3xl font-extrabold leading-none" style={{ color: '#067D62' }}>
            +{decideResult.greenCredits}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">green credits</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {decideResult.netCarbonSavedKg != null
              ? `${decideResult.netCarbonSavedKg.toFixed(1)} kg CO2 saved (net of return shipping).`
              : `${(decideResult.greenCredits / 10).toFixed(1)} kg CO2 saved.`}
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: '#067D62' }}>
            ≈ ₹{decideResult.greenCredits * 2} Amazon Pay to redeem.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Intake({ onBack, demoMode = false, nav = {}, onScrollTo }) {
  const [dragOver, setDragOver]       = useState(false)
  const [file, setFile]               = useState(null)
  const [preview, setPreview]         = useState(null)
  const [name, setName]               = useState('')
  const [price, setPrice]             = useState('')
  const [category, setCategory]       = useState('')

  const [loading, setLoading]         = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [error, setError]             = useState(null)
  const [failedStep, setFailedStep]   = useState(null)
  const [backendOk, setBackendOk]     = useState(null) // null=checking, true=ok, false=unreachable
  const [lowConfidence, setLowConfidence] = useState(false)

  const [gradeResult, setGradeResult]     = useState(null)
  const [decideResult, setDecideResult]   = useState(null)
  const [listingResult, setListingResult] = useState(null)
  const [showReport, setShowReport]       = useState(false)

  const inputRef = useRef(null)
  const hasAutoRun = useRef(false)

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) return
    if (f.size > 4 * 1024 * 1024) {
      setError('Photo is too large (max 4 MB). Please compress it or choose a different image.')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
    setLowConfidence(false)
    setGradeResult(null)
    setDecideResult(null)
    setListingResult(null)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function reset() {
    setFile(null); setPreview(null)
    setName(''); setPrice(''); setCategory('')
    setLoading(false); setLoadingStep(''); setError(null); setFailedStep(null); setLowConfidence(false)
    setGradeResult(null); setDecideResult(null); setListingResult(null); setShowReport(false)
  }

  async function run() {
    if (!file) return
    setLoading(true); setError(null); setFailedStep(null); setLowConfidence(false)
    setGradeResult(null); setDecideResult(null); setListingResult(null)

    try {
      setLoadingStep('Grading condition with AI...')
      const b64 = await toBase64(file)
      let graded
      try {
        graded = await gradeImage({
          imageBase64: b64,
          mediaType: file.type,
          name: name || undefined,
          price: price ? Number(price) : undefined,
          category: category || undefined,
        })
      } catch (gradeErr) {
        setFailedStep('AI condition grading')
        throw gradeErr
      }
      setGradeResult(graded)

      setLoadingStep('Running decision engine...')
      let decided
      try {
        decided = await decide({
          grade: graded.grade,
          price: price ? Number(price) : 0,
          category: graded.category || category || 'default',
          confidence: graded.confidence,
        })
      } catch (decideErr) {
        if (decideErr.status === 422 || decideErr.code === 'low_confidence') {
          setLowConfidence(true)
          return
        }
        setFailedStep('decision engine')
        throw decideErr
      }
      setDecideResult(decided)

      if (decided.decision === 'Resell' || decided.decision === 'Refurbish') {
        setLoadingStep('Generating listing...')
        let listed
        try {
          listed = await generateListing({
            product: graded.product,
            grade: graded.grade,
            observations: graded.observations,
            price: price ? Number(price) : undefined,
          })
        } catch (listErr) {
          setFailedStep('listing generation')
          throw listErr
        }
        setListingResult(listed)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false); setLoadingStep('')
    }
  }

  async function runDemo() {
    if (demoCache) {
      setPreview(DEMO_CONFIG.previewUrl)
      setName(DEMO_CONFIG.name)
      setPrice(String(DEMO_CONFIG.price))
      setCategory(DEMO_CONFIG.category)
      setGradeResult(demoCache.grade)
      setDecideResult(demoCache.decide)
      setListingResult(demoCache.listing)
      return
    }

    setPreview(DEMO_CONFIG.previewUrl)
    setName(DEMO_CONFIG.name)
    setPrice(String(DEMO_CONFIG.price))
    setCategory(DEMO_CONFIG.category)
    setLoading(true)
    setError(null)

    try {
      setLoadingStep('Grading condition with AI...')
      let b64, mediaType
      try {
        const res = await fetch(DEMO_CONFIG.previewUrl)
        const blob = await res.blob()
        mediaType = blob.type || 'image/jpeg'
        b64 = await blobToBase64(blob)
      } catch {
        throw new Error('offline')
      }

      const graded = await gradeImage({
        imageBase64: b64,
        mediaType,
        name: DEMO_CONFIG.name,
        price: DEMO_CONFIG.price,
        category: DEMO_CONFIG.category,
      })
      setGradeResult(graded)

      setLoadingStep('Running decision engine...')
      const decided = await decide({
        grade: graded.grade,
        price: DEMO_CONFIG.price,
        category: graded.category || DEMO_CONFIG.category,
        confidence: graded.confidence,
      })
      setDecideResult(decided)

      const cached = { grade: graded, decide: decided, listing: null }
      if (decided.decision === 'Resell' || decided.decision === 'Refurbish') {
        setLoadingStep('Generating listing...')
        const listed = await generateListing({
          product: graded.product,
          grade: graded.grade,
          observations: graded.observations,
          price: DEMO_CONFIG.price,
        })
        setListingResult(listed)
        cached.listing = listed
      }
      demoCache = cached
    } catch {
      setGradeResult(DEMO_FALLBACK.grade)
      setDecideResult(DEMO_FALLBACK.decide)
      setListingResult(DEMO_FALLBACK.listing)
      demoCache = DEMO_FALLBACK
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }

  async function replayDemo() {
    setError(null)
    setGradeResult(null)
    setDecideResult(null)
    setListingResult(null)
    await runDemo()
  }

  useEffect(() => {
    if (!demoMode || hasAutoRun.current) return
    hasAutoRun.current = true
    runDemo()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Ping the backend on mount so we know immediately if it's unreachable
  useEffect(() => {
    healthCheck()
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false))
  }, [])

  const hasResult = gradeResult && decideResult
  const demoRunning = demoMode && (loading || hasResult)
  const currentStep = hasResult
    ? 4
    : decideResult || loadingStep.startsWith('Generating')
      ? 4
      : gradeResult || loadingStep.startsWith('Running')
        ? 3
        : (file || demoRunning || loadingStep.startsWith('Grading'))
          ? 2
          : 1

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh' }}>
      <TopNav onPrimaryAction={onBack} primaryLabel="Back to home" onHome={onBack} onOpenCart={nav.onOpenCart} cartCount={nav.cartCount} />
      <SubNav
        onGetStarted={nav.onGetStarted}
        onDemoMode={nav.onDemoMode}
        onPersonas={nav.onPersonas}
        onDashboard={nav.onDashboard}
        onMarketplace={nav.onMarketplace}
        onScrollTo={nav.onScrollTo || onScrollTo}
      />

      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <div className="text-sm text-[#565959] mb-4">Amazon Encore › Grade and route a return</div>

        <div className="rounded-md border bg-white p-5 md:p-6 mb-6" style={{ borderColor: '#D5D9D9' }}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
            <div>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-sm hover:text-[#C7511F] transition-colors mb-3"
                style={{ color: '#007185' }}
              >
                <ArrowLeft size={16} />
                Back to Encore home
              </button>
              <h1 className="text-3xl font-bold mb-2 text-[#0F1111]">Grade and route a return</h1>
              <p className="text-[#565959] max-w-2xl">
                {demoMode
                  ? 'Live demo — watching Encore grade a used running shoe at ₹500 and decide its best second life.'
                  : 'Upload a photo, let AI grade the condition, and see the exact value-versus-cost math behind the routing decision.'}
              </p>
            </div>

            {demoMode && (
              <div
                className="rounded-md border px-4 py-3 text-sm font-semibold flex items-center gap-2"
                style={{ borderColor: '#FF9900', backgroundColor: '#fff8e0', color: '#c45500' }}
              >
                <Zap size={14} />
                Demo mode — pre-loaded scenario
              </div>
            )}
            {!demoMode && (
              <div className="rounded-md border bg-[#FBFBFB] px-4 py-3 text-sm text-[#565959]" style={{ borderColor: '#D5D9D9' }}>
                Browser handles the upload. Our API handles the decision logic.
              </div>
            )}
          </div>

          <Stepper currentStep={currentStep} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {demoMode ? (
              <>
                {loading && (
                  <div className="rounded-md border bg-white p-8 flex flex-col items-center gap-4" style={{ borderColor: '#D5D9D9' }}>
                    <Loader2 size={36} className="animate-spin" style={{ color: '#FF9900' }} />
                    <p className="font-semibold text-[#0F1111]">{loadingStep || 'Running demo...'}</p>
                    <p className="text-sm text-[#565959]">Running shoe (used) · ₹500 · Footwear</p>
                  </div>
                )}
                {hasResult && (
                  <>
                    <div
                      className="flex items-center gap-3 bg-white rounded-md border p-4"
                      style={{ borderColor: '#D5D9D9' }}
                    >
                      <img
                        src={preview}
                        alt="demo item"
                        className="h-16 w-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-base text-[#0F1111]">
                          {gradeResult.product || DEMO_CONFIG.name}
                        </p>
                        <p className="text-sm text-[#565959]">
                          Original price: {formatCurrency(DEMO_CONFIG.price)}
                        </p>
                        <p className="text-sm text-[#879596]">{gradeResult.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={reset}
                        className="ml-auto text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded border transition-colors"
                        style={{ borderColor: '#D5D9D9', color: '#565959' }}
                      >
                        <RotateCcw size={12} />
                        Reset
                      </button>
                    </div>
                    <GradeCard result={gradeResult} />
                    <DecisionCard result={decideResult} />
                    <GreenCreditsCard greenCredits={decideResult.greenCredits} netCarbonSavedKg={decideResult.netCarbonSavedKg} />
                    <RewardCard listing={listingResult} decideResult={decideResult} />
                  </>
                )}
              </>
            ) : (
              <>
                {lowConfidence ? (
                  <>
                    <GradeCard result={gradeResult} />
                    <LowConfidenceCard confidence={gradeResult?.confidence} onReset={reset} />
                  </>
                ) : !hasResult ? (
                  <>
                    <div className="rounded-md border bg-white p-5 md:p-6" style={{ borderColor: '#D5D9D9' }}>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-2">Step 1</p>
                      <h2 className="text-2xl font-bold text-[#0F1111] mb-2">Upload a product photo</h2>

                      <div
                        className="rounded-md border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-colors"
                        style={{
                          borderColor: dragOver ? '#FF9900' : '#D5D9D9',
                          backgroundColor: dragOver ? '#fff8f0' : 'white',
                          cursor: file ? 'default' : 'pointer',
                        }}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        onClick={() => !file && inputRef.current?.click()}
                      >
                        <input
                          ref={inputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFile(e.target.files[0])}
                        />

                        {preview ? (
                          <div className="flex flex-col items-center gap-3 w-full">
                            <div className="relative inline-block">
                              <img
                                src={preview}
                                alt="preview"
                                className="h-56 rounded-lg object-contain max-w-full"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFile(null)
                                  setPreview(null)
                                }}
                                className="absolute -top-2 -right-2 bg-white rounded-full border shadow-sm p-0.5 hover:bg-gray-50"
                                style={{ borderColor: '#D5D9D9' }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p className="text-sm text-[#565959]">
                              {file.name} · {(file.size / 1024).toFixed(0)} KB
                            </p>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                              className="text-sm font-semibold underline"
                              style={{ color: '#007185' }}
                            >
                              Change photo
                            </button>
                          </div>
                        ) : (
                          <>
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: '#131921' }}
                            >
                              <Upload size={24} style={{ color: '#FF9900' }} />
                            </div>
                            <p className="font-semibold text-base text-[#0F1111] text-center max-w-xs">
                              Snap or drop a photo — Encore grades it, decides its best second life, and writes the listing.
                            </p>
                            <p className="text-sm text-[#565959]">JPG, PNG, WEBP · under 4 MB</p>
                            <div className="flex flex-wrap justify-center gap-2 mt-1">
                              {CATEGORY_HINTS.map(({ Icon, label }) => (
                                <span
                                  key={label}
                                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
                                  style={{ borderColor: '#D5D9D9', color: '#565959', backgroundColor: '#F7F8F8' }}
                                >
                                  <Icon size={12} />
                                  {label}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div
                      className="bg-white rounded-md border p-5 md:p-6 flex flex-col gap-4"
                      style={{ borderColor: '#D5D9D9' }}
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-1">Step 2</p>
                        <h2 className="text-2xl font-bold text-[#0F1111] mb-2">Optional listing context</h2>
                        <p className="text-sm text-[#565959]">
                          Product name, price, and category help the condition grade and resale math stay grounded.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-[#565959]">Product name</label>
                          <input
                            type="text"
                            placeholder="e.g. Nike Air Max"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border rounded-md px-3 py-2.5 text-sm outline-none"
                            style={{ borderColor: '#D5D9D9' }}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-[#565959]">Original price (₹)</label>
                          <input
                            type="number"
                            placeholder="e.g. 500"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min="0"
                            className="border rounded-md px-3 py-2.5 text-sm outline-none"
                            style={{ borderColor: '#D5D9D9' }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565959]">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="border rounded-md px-3 py-2.5 text-sm outline-none bg-white"
                          style={{ borderColor: '#D5D9D9' }}
                        >
                          <option value="">Auto-detect from image</option>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {backendOk === false && (
                      <div
                        className="flex flex-col gap-2 text-sm rounded-md border p-4"
                        style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          <AlertCircle size={16} className="flex-shrink-0" />
                          Backend unreachable
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: '#7f1d1d' }}>
                          The app cannot connect to the Encore API at <code className="font-mono bg-red-100 px-1 rounded">{API_BASE_URL}</code>.
                          {!import.meta.env.VITE_API_URL && (
                            <> Set <code className="font-mono bg-red-100 px-1 rounded">VITE_API_URL</code> to your Railway backend URL in Amplify environment variables and redeploy.</>
                          )}
                        </p>
                      </div>
                    )}

                    {error && (
                      <div
                        className="flex flex-col gap-1.5 text-sm text-red-700 rounded-md border p-4"
                        style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
                      >
                        <div className="flex items-center gap-2 font-semibold">
                          <AlertCircle size={16} className="flex-shrink-0" />
                          {failedStep ? `Failed at: ${failedStep}` : 'Something went wrong'}
                        </div>
                        <span className="break-all text-xs font-mono pl-6">{error}</span>
                        {error === 'Failed to fetch' && (
                          <p className="text-xs pl-6 mt-1" style={{ color: '#b91c1c' }}>
                            The API at <code className="font-mono bg-red-100 px-1 rounded">{API_BASE_URL}</code> is not responding.
                            {!import.meta.env.VITE_API_URL && ' VITE_API_URL is not set — add your Railway URL to Amplify env vars.'}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="rounded-md border bg-white p-5 md:p-6" style={{ borderColor: '#D5D9D9' }}>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-2">Step 3</p>
                      <h2 className="text-2xl font-bold text-[#0F1111] mb-2">Run the Encore decision engine</h2>
                      <p className="text-sm text-[#565959] mb-5">
                        We call the grade API, then our routing logic, and generate a listing if resale wins.
                      </p>

                      <button
                        type="button"
                        onClick={run}
                        disabled={!file || loading}
                        style={{
                          backgroundColor: file && !loading ? '#FFD814' : '#E3E6E6',
                          color: file && !loading ? '#0F1111' : '#879596',
                        }}
                        className="w-full py-3.5 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            {loadingStep || 'Processing...'}
                          </>
                        ) : (
                          'Grade and route this return'
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="flex items-center gap-3 bg-white rounded-md border p-4"
                      style={{ borderColor: '#D5D9D9' }}
                    >
                      <img
                        src={preview}
                        alt="item"
                        className="h-16 w-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-base text-[#0F1111] truncate">
                          {gradeResult.product || name || 'Your item'}
                        </p>
                        {price && (
                          <p className="text-sm text-[#565959]">
                            Original price: {formatCurrency(price)}
                          </p>
                        )}
                        <p className="text-sm text-[#879596]">{gradeResult.category}</p>
                      </div>
                    </div>

                    <GradeCard result={gradeResult} />
                    <DecisionCard result={decideResult} />
                    <GreenCreditsCard greenCredits={decideResult.greenCredits} netCarbonSavedKg={decideResult.netCarbonSavedKg} />
                    <RewardCard listing={listingResult} decideResult={decideResult} />

                    {listingResult && (
                      <ListingPreview
                        listing={listingResult}
                        gradeResult={gradeResult}
                        decideResult={decideResult}
                        imageUrl={preview}
                        originalPrice={price ? Number(price) : 0}
                        category={gradeResult.category || category}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => setShowReport(!showReport)}
                      className="w-full py-3 rounded-full border font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all bg-white"
                      style={{ borderColor: '#D5D9D9', color: '#0F1111' }}
                    >
                      <Award size={16} />
                      {showReport ? 'Hide Encore report card' : 'View Encore report card'}
                    </button>

                    {showReport && (
                      <ReportCard
                        gradeResult={gradeResult}
                        decideResult={decideResult}
                        listingResult={listingResult}
                        productName={gradeResult.product || name || 'Your item'}
                        originalPrice={price ? Number(price) : 0}
                        category={gradeResult.category || category}
                        imageUrl={preview}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 xl:sticky xl:top-24 self-start">
            <div className="rounded-md border bg-white p-5" style={{ borderColor: '#D5D9D9' }}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-2">
                Return summary
              </p>
              {preview ? (
                <img
                  src={preview}
                  alt="selected item"
                  className="h-48 w-full rounded-md object-cover mb-4"
                />
              ) : (
                <div
                  className="h-48 rounded-md border flex items-center justify-center text-center px-6 mb-4"
                  style={{ borderColor: '#D5D9D9', backgroundColor: '#F7F8F8' }}
                >
                  <div>
                    <Upload size={28} className="mx-auto mb-3 text-[#879596]" />
                    <p className="text-sm font-semibold text-[#0F1111]">
                      Your uploaded item will appear here
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#565959]">Product name</span>
                  <span className="font-medium text-[#0F1111] text-right">
                    {name || gradeResult?.product || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#565959]">Original price</span>
                  <span className="font-medium text-[#0F1111]">
                    {price ? formatCurrency(price) : 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#565959]">Category</span>
                  <span className="font-medium text-[#0F1111] text-right">
                    {gradeResult?.category || category || 'Auto-detect'}
                  </span>
                </div>
                {gradeResult?.grade && (
                  <div className="flex justify-between gap-3">
                    <span className="text-[#565959]">AI grade</span>
                    <span className="font-medium text-[#0F1111]">{gradeResult.grade}</span>
                  </div>
                )}
                {decideResult?.decision && (
                  <div className="flex justify-between gap-3">
                    <span className="text-[#565959]">Decision</span>
                    <span className="font-medium text-[#0F1111]">{decideResult.decision}</span>
                  </div>
                )}
              </div>
            </div>

            {!hasResult ? (
              <>
                <div className="rounded-md border bg-white p-5" style={{ borderColor: '#D5D9D9' }}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-2">
                    What Encore returns
                  </p>
                  <div className="space-y-3 text-sm text-[#565959]">
                    <p>A condition grade with confidence and observed flaws.</p>
                    <p>Visible math for expected resale value minus processing cost.</p>
                    <p>A generated listing if resale wins, or green credits if it does not.</p>
                  </div>
                </div>

                <div className="rounded-md border bg-white p-5" style={{ borderColor: '#D5D9D9' }}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-2">
                    Sample long-tail decision
                  </p>
                  <p className="font-semibold text-[#0F1111] mb-3">₹500 running shoe → Donate</p>
                  <div
                    className="rounded-md border p-4"
                    style={{ backgroundColor: '#fff8e0', borderColor: '#F7CA00' }}
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#565959]">Expected resale value</span>
                      <span className="font-semibold text-[#0F1111]">₹200</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#565959]">Processing cost</span>
                      <span className="font-semibold text-[#B12704]">− ₹250</span>
                    </div>
                    <div
                      className="flex justify-between text-sm border-t pt-2"
                      style={{ borderColor: '#F7CA00' }}
                    >
                      <span className="font-semibold text-[#0F1111]">Net resell</span>
                      <span className="font-bold text-[#B12704]">− ₹50</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-md border bg-white p-5" style={{ borderColor: '#D5D9D9' }}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-2">
                    Outcome summary
                  </p>
                  <div
                    className="rounded-md px-4 py-3 mb-4"
                    style={{ backgroundColor: DECISION_CFG[decideResult.decision]?.bg ?? '#F7F8F8' }}
                  >
                    <p
                      className="text-sm font-bold"
                      style={{ color: DECISION_CFG[decideResult.decision]?.color ?? '#0F1111' }}
                    >
                      {decideResult.decision}
                    </p>
                    <p className="text-sm text-[#565959] mt-1">{decideResult.reason}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#565959]">Expected resale value</span>
                      <span className="font-medium text-[#0F1111]">
                        {formatCurrency(decideResult.expectedResaleValue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#565959]">Processing cost</span>
                      <span className="font-medium text-[#0F1111]">
                        {formatCurrency(decideResult.processingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#565959]">Green credits</span>
                      <span className="font-medium text-[#0F1111]">
                        +{decideResult.greenCredits}
                      </span>
                    </div>
                  </div>
                </div>

                {listingResult && (
                  <ListingPreview
                    listing={listingResult}
                    gradeResult={gradeResult}
                    decideResult={decideResult}
                    imageUrl={preview}
                    originalPrice={price ? Number(price) : 0}
                    category={gradeResult.category || category}
                  />
                )}

                <div className="rounded-md border bg-white p-5" style={{ borderColor: '#D5D9D9' }}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-3">
                    Next action
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={demoMode ? replayDemo : reset}
                      className="w-full py-3 rounded-full border font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all bg-white"
                      style={{ borderColor: '#D5D9D9', color: '#0F1111' }}
                    >
                      <RotateCcw size={16} />
                      {demoMode ? 'Replay demo' : 'Try another item'}
                    </button>
                    <button
                      type="button"
                      onClick={onBack}
                      style={{ backgroundColor: '#FFD814', color: '#0F1111' }}
                      className="w-full py-3 rounded-full font-semibold text-sm hover:brightness-95 transition-all"
                    >
                      Back to Encore home
                    </button>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
