import { useRef, useState } from 'react'
import {
  AlertCircle, ArrowLeft, ArrowLeftRight, Award, BookOpen, Camera, CheckCircle2,
  Heart, ImagePlus, Leaf, Loader2, Package, Play, RotateCcw,
  ShieldCheck, ShoppingBag, TrendingUp, Upload, Users, Wrench, Zap,
} from 'lucide-react'
import TopNav from '../components/TopNav.jsx'
import SubNav from '../components/SubNav.jsx'
import ReportCard from '../components/ReportCard.jsx'
import ListingPreview from '../components/ListingPreview.jsx'
import { gradeImage, decide, generateListing } from '../lib/api.js'

/* ── import real product images ──────────────────────────────────── */
import shoeImg from '../assets/listings/s1.jpg'
import bookImg from '../assets/listings/book1.jpg'
import laptopImg from '../assets/listings/lap1.webp'

/* ── colour configs ──────────────────────────────────────────────── */

const GRADE_CFG = {
  'Like New':     { color: '#067D62', bg: '#e6f4ea' },
  'Very Good':    { color: '#007185', bg: '#e0f0f3' },
  'Good':         { color: '#c45500', bg: '#fff3e0' },
  'Acceptable':   { color: '#b12704', bg: '#fde8d8' },
  'Not Sellable': { color: '#cc0c39', bg: '#fce8e8' },
}

const DECISION_CFG = {
  'Resell':    { color: '#067D62', bg: '#e6f4ea', Icon: TrendingUp,     label: 'Listed for sale' },
  'Refurbish': { color: '#007185', bg: '#e0f0f3', Icon: Wrench,         label: 'Prepared for refurbishment' },
  'Donate':    { color: '#FF9900', bg: '#fff8e0', Icon: Heart,           label: 'Routed to donation' },
  'Recycle':   { color: '#555555', bg: '#f3f3f3', Icon: Leaf,           label: 'Sent to responsible recycling' },
  'Exchange':  { color: '#007185', bg: '#e0f0f3', Icon: ArrowLeftRight, label: 'Trade-in for Amazon Pay credit' },
}

/* ── helpers ──────────────────────────────────────────────────────── */

function fmt(v) { return `₹${Number(v ?? 0).toLocaleString('en-IN')}` }

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function urlToBase64(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ b64: reader.result.split(',')[1], type: blob.type || 'image/jpeg' })
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/* ── story definitions ───────────────────────────────────────────── */

const STORIES = [
  {
    id: 'priya',
    name: 'Priya',
    role: 'Online shopper',
    Icon: ShoppingBag,
    pain: 'Returned a ₹500 shoe. 600 km back to warehouse. Costs more to relist than it is worth. Today it is written off.',
    tagline: 'The headline moment — when the smartest resale decision is not to resell.',
    item: { name: 'Running shoe (used)', price: 500, category: 'Footwear' },
    defaultImage: shoeImg,
    fallback: {
      grade: {
        product: 'Running shoe', category: 'Footwear', grade: 'Good', confidence: 82,
        observations: ['Sole shows wear at heel', 'Minor scuffs on toe cap', 'Laces intact'],
        conditionReport: 'Gently used running shoe with visible wear on the sole and minor cosmetic scuffs. Functionally intact.',
        co2SavedKgEstimate: 2.4,
      },
      decide: {
        decision: 'Donate', expectedResaleValue: 200, processingCost: 250, netResell: -50,
        greenCredits: 24, reason: 'Relisting recovers ₹200 but costs ₹250 — a ₹50 loss, so donating is the better outcome.',
      },
      listing: null,
    },
  },
  {
    id: 'rahul',
    name: 'Rahul',
    role: 'New parent',
    Icon: Users,
    pain: 'Baby monitor works perfectly but will not list on classifieds. 50 nearby parents want it.',
    tagline: 'Trusted peer-to-peer resale with an AI-verified trust report.',
    item: { name: 'Laptop (Dell Inspiron)', price: 45000, category: 'Electronics' },
    defaultImage: laptopImg,
    fallback: {
      grade: {
        product: 'Dell Inspiron Laptop', category: 'Electronics', grade: 'Like New', confidence: 94,
        observations: ['Screen pristine', 'All ports functional', 'Keyboard no visible wear', 'Battery health excellent'],
        conditionReport: 'Practically new laptop with minimal usage signs. All components tested and functional.',
        co2SavedKgEstimate: 18,
      },
      decide: {
        decision: 'Resell', expectedResaleValue: 31500, processingCost: 400, netResell: 31100,
        greenCredits: 180, reason: 'Resale recovers ₹31,500 against ₹400 in costs, leaving a net of ₹31,100.',
      },
      listing: {
        title: 'Dell Inspiron Laptop — Like New, Encore Verified',
        description: 'Fully functional laptop with pristine screen. All ports tested, keyboard has no visible wear. Battery health excellent.',
        conditionLabel: 'Like New', suggestedPrice: 31500,
      },
    },
  },
  {
    id: 'seller',
    name: 'Small Seller',
    role: 'Amazon FBA seller',
    Icon: Package,
    pain: '200 returns per month, manually inspects and re-photographs each. Hours of labor, no AI.',
    tagline: 'Batch processing — AI grades and routes in seconds, not hours.',
    item: null,
    defaultImage: null,
    fallback: null,
  },
]

/* ── batch data for small seller ─────────────────────────────────── */

const BATCH_ITEMS = [
  { name: 'Atomic Habits (Paperback)', category: 'Books', price: 799, grade: 'Very Good', decision: 'Resell', expectedResaleValue: 440, processingCost: 80, netResell: 360, greenCredits: 12, co2: 1.2 },
  { name: 'Running shoe (Nike)', category: 'Footwear', price: 500, grade: 'Good', decision: 'Donate', expectedResaleValue: 200, processingCost: 250, netResell: -50, greenCredits: 24, co2: 2.4 },
  { name: 'Wireless earbuds', category: 'Electronics', price: 2500, grade: 'Acceptable', decision: 'Donate', expectedResaleValue: 625, processingCost: 400, netResell: 225, greenCredits: 180, co2: 18 },
  { name: 'Cotton t-shirt (M)', category: 'Apparel', price: 400, grade: 'Like New', decision: 'Resell', expectedResaleValue: 280, processingCost: 180, netResell: 100, greenCredits: 35, co2: 3.5 },
  { name: 'Kitchen mixer grinder', category: 'Home & Kitchen', price: 3500, grade: 'Good', decision: 'Resell', expectedResaleValue: 1400, processingCost: 300, netResell: 1100, greenCredits: 80, co2: 8 },
]

/* ── sub-components ──────────────────────────────────────────────── */

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
  return (
    <div className="rounded-md border bg-white p-5 flex flex-col gap-4 encore-fade-in" style={{ borderColor: '#D5D9D9' }}>
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} style={{ color: cfg.color }} />
        <span className="font-bold text-base" style={{ color: '#0F1111' }}>AI condition grade</span>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-base font-bold px-3 py-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}>{result.grade}</span>
        <ConfidenceBar value={result.confidence} />
        {result.category && <span className="text-sm text-[#565959] flex-shrink-0">Category: {result.category}</span>}
      </div>
      <div className="rounded-md border bg-[#F7F8F8] p-4" style={{ borderColor: '#D5D9D9' }}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-2">Condition report</p>
        <p className="text-sm text-[#565959] leading-relaxed">{result.conditionReport}</p>
      </div>
      {result.observations?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {result.observations.map((obs, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-full border"
              style={{ borderColor: '#D5D9D9', color: '#555', backgroundColor: '#fafafa' }}>{obs}</span>
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
    <div className="rounded-md border bg-white p-5 flex flex-col gap-4 encore-fade-in" style={{ borderColor: '#D5D9D9', animationDelay: '0.1s' }}>
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: cfg.color }} />
        <span className="font-bold text-base" style={{ color: '#0F1111' }}>Routing decision</span>
      </div>
      <div className="rounded-md px-4 py-3 flex items-center gap-3" style={{ backgroundColor: cfg.bg }}>
        <Icon size={22} style={{ color: cfg.color }} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: cfg.color }}>Encore outcome</p>
          <span className="text-2xl font-extrabold" style={{ color: cfg.color }}>{result.decision}</span>
        </div>
        <span className="ml-auto text-sm font-semibold hidden sm:block" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
      <div className="rounded-md border p-4" style={{ borderColor: '#D5D9D9', backgroundColor: '#fafafa' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">The math</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-white border p-3 text-center" style={{ borderColor: '#E3E6E6' }}>
            <p className="text-xs text-[#879596] mb-1">Expected resale value</p>
            <p className="font-bold text-xl text-[#0F1111]">{fmt(result.expectedResaleValue)}</p>
          </div>
          <div className="rounded-md bg-white border p-3 text-center" style={{ borderColor: '#E3E6E6' }}>
            <p className="text-xs text-[#879596] mb-1">Processing cost</p>
            <p className="font-bold text-xl text-[#0F1111]">{fmt(result.processingCost)}</p>
          </div>
          <div className="rounded-md bg-white border p-3 text-center" style={{ borderColor: '#E3E6E6' }}>
            <p className="text-xs text-[#879596] mb-1">Net resell</p>
            <p className="font-extrabold text-2xl"
              style={{ color: isLoss ? '#cc0c39' : '#067D62' }}>
              {isLoss ? `−${fmt(Math.abs(net))}` : fmt(net)}
            </p>
          </div>
        </div>
        <p className="text-sm text-[#565959] mt-4">
          {fmt(result.expectedResaleValue)} − {fmt(result.processingCost)} ={' '}
          <strong style={{ color: isLoss ? '#cc0c39' : '#067D62' }}>
            {isLoss ? `−${fmt(Math.abs(net))}` : fmt(net)}
          </strong>
        </p>
      </div>
      <p className="text-sm text-[#565959] leading-relaxed">{result.reason}</p>
    </div>
  )
}

function RewardCard({ listing, decideResult }) {
  if (listing) {
    return (
      <div className="rounded-md border bg-white p-5 flex flex-col gap-4 encore-fade-in" style={{ borderColor: '#D5D9D9', animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} style={{ color: '#067D62' }} />
          <span className="font-bold text-base" style={{ color: '#0F1111' }}>Generated listing</span>
          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#e6f4ea', color: '#067D62' }}>Encore Verified</span>
        </div>
        <div className="rounded-md border bg-[#FBFBFB] p-4" style={{ borderColor: '#D5D9D9' }}>
          <h3 className="font-bold text-lg leading-snug" style={{ color: '#007185' }}>{listing.title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed mt-2">{listing.description}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#e0f0f3', color: '#007185' }}>{listing.conditionLabel}</span>
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
    <div className="rounded-md border bg-white p-5 flex flex-col gap-4 encore-fade-in" style={{ borderColor: '#D5D9D9', animationDelay: '0.2s' }}>
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
          Relisting would recover {fmt(decideResult.expectedResaleValue)} but costs{' '}
          {fmt(decideResult.processingCost)}, a net loss of{' '}
          {fmt(Math.abs(decideResult.netResell))}.{' '}
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
        <p className="text-sm text-gray-600 leading-relaxed">
          That is {(decideResult.greenCredits / 10).toFixed(1)} kg CO2 saved from landfill.
          Redeem against any future Amazon order.
        </p>
      </div>
    </div>
  )
}

/* ── single story runner ─────────────────────────────────────────── */

function StoryScenario({ story }) {
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [gradeResult, setGradeResult] = useState(null)
  const [decideResult, setDecideResult] = useState(null)
  const [listingResult, setListingResult] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [error, setError] = useState(null)
  const [customImage, setCustomImage] = useState(null)
  const [customPreview, setCustomPreview] = useState(null)
  const ran = useRef(false)
  const fileRef = useRef(null)

  const activeImage = customPreview || story.defaultImage

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCustomImage(file)
    const reader = new FileReader()
    reader.onload = () => setCustomPreview(reader.result)
    reader.readAsDataURL(file)
    // reset previous results when image changes
    ran.current = false
    setGradeResult(null)
    setDecideResult(null)
    setListingResult(null)
    setShowReport(false)
  }

  async function run() {
    if (ran.current && gradeResult) return
    setLoading(true)
    setError(null)
    setGradeResult(null)
    setDecideResult(null)
    setListingResult(null)
    setShowReport(false)

    try {
      setLoadingStep('Grading condition with AI...')
      let b64, mediaType

      if (customImage) {
        // user uploaded their own image
        b64 = await fileToBase64(customImage)
        mediaType = customImage.type || 'image/jpeg'
      } else {
        // use the default bundled image
        try {
          const res = await fetch(story.defaultImage)
          const blob = await res.blob()
          mediaType = blob.type || 'image/jpeg'
          b64 = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result.split(',')[1])
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        } catch {
          throw new Error('offline')
        }
      }

      const graded = await gradeImage({
        imageBase64: b64, mediaType,
        name: story.item.name, price: story.item.price, category: story.item.category,
      })
      setGradeResult(graded)

      setLoadingStep('Running decision engine...')
      const decided = await decide({
        grade: graded.grade, price: story.item.price,
        category: graded.category || story.item.category, confidence: graded.confidence,
      })
      setDecideResult(decided)

      if (decided.decision === 'Resell' || decided.decision === 'Refurbish') {
        setLoadingStep('Generating listing...')
        const listed = await generateListing({
          product: graded.product, grade: graded.grade,
          observations: graded.observations, price: story.item.price,
        })
        setListingResult(listed)
      }
      ran.current = true
    } catch {
      setGradeResult(story.fallback.grade)
      setDecideResult(story.fallback.decide)
      setListingResult(story.fallback.listing)
      ran.current = true
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }

  function reset() {
    ran.current = false
    setGradeResult(null)
    setDecideResult(null)
    setListingResult(null)
    setShowReport(false)
    setError(null)
  }

  const hasResult = gradeResult && decideResult
  const StoryIcon = story.Icon

  return (
    <div className="space-y-4">
      {/* story card with image */}
      <div className="rounded-lg border bg-white overflow-hidden encore-fade-in" style={{ borderColor: '#D5D9D9' }}>
        <div className="flex flex-col md:flex-row">
          {/* product image panel */}
          <div className="md:w-64 flex-shrink-0 relative"
            style={{ backgroundColor: '#F7F8F8' }}>
            <img
              src={activeImage}
              alt={story.item.name}
              className="w-full h-48 md:h-full object-contain p-4"
            />
            {/* upload overlay */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:brightness-95"
              style={{ backgroundColor: '#FFD814', color: '#0F1111' }}
            >
              <Camera size={13} />
              {customImage ? 'Change photo' : 'Upload your photo'}
            </button>
            {customImage && (
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#e6f4ea', color: '#067D62' }}>
                Custom image
              </span>
            )}
          </div>

          {/* persona info */}
          <div className="flex-1 p-5 flex flex-col justify-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#131921' }}>
                <StoryIcon size={20} style={{ color: '#FF9900' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold" style={{ color: '#0F1111' }}>{story.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full border"
                    style={{ borderColor: '#D5D9D9', color: '#565959' }}>{story.role}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#007185' }}>{story.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-[#565959] leading-relaxed">{story.pain}</p>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="font-semibold" style={{ color: '#0F1111' }}>{story.item.name}</span>
              <span style={{ color: '#565959' }}>{fmt(story.item.price)}</span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#F3F3F3', color: '#565959' }}>{story.item.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* action / results */}
      {!hasResult ? (
        <div className="rounded-lg border bg-white p-6 flex flex-col items-center gap-4 encore-fade-in"
          style={{ borderColor: '#D5D9D9' }}>
          {loading ? (
            <>
              <Loader2 size={36} className="animate-spin" style={{ color: '#FF9900' }} />
              <p className="font-semibold text-[#0F1111]">{loadingStep || 'Processing...'}</p>
              <p className="text-sm text-[#565959]">
                {story.item.name} · {fmt(story.item.price)} · {story.item.category}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#131921' }}>
                <Zap size={28} style={{ color: '#FF9900' }} />
              </div>
              <p className="text-[#565959] text-center max-w-md">
                Run {story.name}'s scenario through the Encore AI grading and disposition engine.
                {!customImage && ' Or upload your own photo to test with a real item.'}
              </p>
              <button type="button" onClick={run}
                style={{ backgroundColor: '#FFD814', color: '#0F1111' }}
                className="px-8 py-3 rounded-full font-bold text-base hover:brightness-95 transition-all flex items-center gap-2">
                <Play size={18} />
                Run {story.name}'s story
              </button>
            </>
          )}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-700 rounded-md border p-4 w-full"
              style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <GradeCard result={gradeResult} />
          <DecisionCard result={decideResult} />
          <RewardCard listing={listingResult} decideResult={decideResult} />

          {listingResult && (
            <ListingPreview
              listing={listingResult}
              gradeResult={gradeResult}
              decideResult={decideResult}
              imageUrl={activeImage}
              originalPrice={story.item.price}
              category={gradeResult.category || story.item.category}
            />
          )}

          {/* report card toggle */}
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowReport(!showReport)}
              className="flex-1 py-3 rounded-full border font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all bg-white encore-card-hover"
              style={{ borderColor: '#D5D9D9', color: '#0F1111' }}>
              <Award size={16} />
              {showReport ? 'Hide report card' : 'View Encore report card'}
            </button>
            <button type="button" onClick={reset}
              className="px-6 py-3 rounded-full border font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all bg-white"
              style={{ borderColor: '#D5D9D9', color: '#565959' }}>
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          {showReport && (
            <ReportCard
              gradeResult={gradeResult}
              decideResult={decideResult}
              listingResult={listingResult}
              productName={gradeResult.product || story.item.name}
              originalPrice={story.item.price}
              category={gradeResult.category || story.item.category}
              imageUrl={activeImage}
            />
          )}
        </>
      )}
    </div>
  )
}

/* ── batch processor for small seller ────────────────────────────── */

function BatchScenario() {
  const [processed, setProcessed] = useState([])
  const [processing, setProcessing] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(-1)

  async function processBatch() {
    setProcessing(true)
    setProcessed([])
    for (let i = 0; i < BATCH_ITEMS.length; i++) {
      setCurrentIdx(i)
      await new Promise(r => setTimeout(r, 400))
      setProcessed(prev => [...prev, BATCH_ITEMS[i]])
    }
    setCurrentIdx(-1)
    setProcessing(false)
  }

  function reset() {
    setProcessed([])
    setProcessing(false)
    setCurrentIdx(-1)
  }

  const totalResell = processed.filter(i => i.decision === 'Resell').length
  const totalDonate = processed.filter(i => i.decision === 'Donate').length
  const totalValue = processed.reduce((s, i) => s + Math.max(0, i.netResell), 0)
  const totalCredits = processed.reduce((s, i) => s + i.greenCredits, 0)
  const done = processed.length === BATCH_ITEMS.length

  return (
    <div className="space-y-4">
      {/* persona card */}
      <div className="rounded-lg border bg-white p-5 flex flex-col md:flex-row md:items-center gap-4 encore-fade-in"
        style={{ borderColor: '#D5D9D9' }}>
        <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#131921' }}>
          <Package size={24} style={{ color: '#FF9900' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold" style={{ color: '#0F1111' }}>Small Seller</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full border"
              style={{ borderColor: '#D5D9D9', color: '#565959' }}>Amazon FBA seller</span>
          </div>
          <p className="text-sm text-[#565959]">200 returns per month, manually inspects and re-photographs each. Hours of labor, no AI.</p>
          <p className="text-xs mt-1" style={{ color: '#007185' }}>Batch processing — AI grades and routes in seconds, not hours.</p>
        </div>
      </div>

      {/* batch table */}
      <div className="rounded-lg border bg-white overflow-hidden encore-fade-in" style={{ borderColor: '#D5D9D9', animationDelay: '0.1s' }}>
        <div className="p-5 border-b" style={{ borderColor: '#D5D9D9' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-1">Batch returns</p>
              <p className="text-lg font-bold" style={{ color: '#0F1111' }}>5 items awaiting processing</p>
            </div>
            {!processing && !done && (
              <button type="button" onClick={processBatch}
                style={{ backgroundColor: '#FFD814', color: '#0F1111' }}
                className="px-6 py-2.5 rounded-full font-bold text-sm hover:brightness-95 transition-all flex items-center gap-2">
                <Zap size={16} />
                Process all returns
              </button>
            )}
            {done && (
              <button type="button" onClick={reset}
                className="px-6 py-2.5 rounded-full border font-semibold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
                style={{ borderColor: '#D5D9D9', color: '#565959' }}>
                <RotateCcw size={14} />
                Reset batch
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F3F3F3' }}>
                <th className="text-left px-4 py-3 font-semibold text-[#565959]">Item</th>
                <th className="text-left px-4 py-3 font-semibold text-[#565959]">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-[#565959]">Price</th>
                <th className="text-center px-4 py-3 font-semibold text-[#565959]">Grade</th>
                <th className="text-center px-4 py-3 font-semibold text-[#565959]">Decision</th>
                <th className="text-right px-4 py-3 font-semibold text-[#565959]">Net value</th>
              </tr>
            </thead>
            <tbody>
              {BATCH_ITEMS.map((item, idx) => {
                const isProcessed = idx < processed.length
                const isCurrent = idx === currentIdx
                const gradeCfg = GRADE_CFG[item.grade]
                const decCfg = DECISION_CFG[item.decision]
                const isLoss = item.netResell < 0

                return (
                  <tr key={idx}
                    className="border-t transition-all"
                    style={{
                      borderColor: '#E3E6E6',
                      backgroundColor: isCurrent ? '#fff8e0' : isProcessed ? '#fafffe' : 'white',
                    }}>
                    <td className="px-4 py-3 font-medium" style={{ color: '#0F1111' }}>
                      <div className="flex items-center gap-2">
                        {isCurrent && <Loader2 size={14} className="animate-spin" style={{ color: '#FF9900' }} />}
                        {isProcessed && !isCurrent && <CheckCircle2 size={14} style={{ color: '#067D62' }} />}
                        {!isProcessed && !isCurrent && <span className="w-3.5 h-3.5 rounded-full border" style={{ borderColor: '#D5D9D9' }} />}
                        {item.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#565959]">{item.category}</td>
                    <td className="px-4 py-3 text-right text-[#0F1111]">{fmt(item.price)}</td>
                    <td className="px-4 py-3 text-center">
                      {isProcessed ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: gradeCfg.bg, color: gradeCfg.color }}>{item.grade}</span>
                      ) : <span className="text-[#879596]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isProcessed ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: decCfg.bg, color: decCfg.color }}>{item.decision}</span>
                      ) : <span className="text-[#879596]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isProcessed ? (
                        <span className="font-bold"
                          style={{ color: isLoss ? '#cc0c39' : '#067D62' }}>
                          {isLoss ? `−${fmt(Math.abs(item.netResell))}` : fmt(item.netResell)}
                        </span>
                      ) : <span className="text-[#879596]">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* summary row */}
        {done && (
          <div className="border-t p-5 grid grid-cols-2 md:grid-cols-4 gap-4 encore-fade-in" style={{ borderColor: '#D5D9D9', backgroundColor: '#FBFBFB' }}>
            <div>
              <p className="text-xs text-[#879596] mb-0.5">Total processed</p>
              <p className="text-xl font-bold" style={{ color: '#FF9900' }}>{processed.length}</p>
            </div>
            <div>
              <p className="text-xs text-[#879596] mb-0.5">Routed to resell</p>
              <p className="text-xl font-bold" style={{ color: '#067D62' }}>{totalResell}</p>
            </div>
            <div>
              <p className="text-xs text-[#879596] mb-0.5">Routed to donate</p>
              <p className="text-xl font-bold" style={{ color: '#FF9900' }}>{totalDonate}</p>
            </div>
            <div>
              <p className="text-xs text-[#879596] mb-0.5">Value recovered</p>
              <p className="text-xl font-bold" style={{ color: '#067D62' }}>{fmt(totalValue)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── main page ───────────────────────────────────────────────────── */

export default function Personas({ onBack, nav = {}, onScrollTo }) {
  const [activeTab, setActiveTab] = useState('priya')

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh' }}>
      <TopNav onPrimaryAction={onBack} primaryLabel="Back to home" onHome={onBack} onOpenCart={nav.onOpenCart} cartCount={nav.cartCount} onSignIn={nav.onSignIn} onMyListings={nav.onMyListings} onProfile={nav.onProfile} />
      <SubNav
        onGetStarted={nav.onGetStarted}
        onDemoMode={nav.onDemoMode}
        onDashboard={nav.onDashboard}
        onMarketplace={nav.onMarketplace}
        onScrollTo={nav.onScrollTo || onScrollTo}
        onSignIn={nav.onSignIn}
      />

      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <div className="text-sm text-[#565959] mb-4">Amazon Encore › Encore stories</div>

        <div className="rounded-lg border bg-white p-5 md:p-6 mb-6 encore-fade-in" style={{ borderColor: '#D5D9D9' }}>
          <button type="button" onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm hover:text-[#C7511F] transition-colors mb-3"
            style={{ color: '#007185' }}>
            <ArrowLeft size={16} />
            Back to Encore home
          </button>
          <h1 className="text-3xl font-bold mb-2 text-[#0F1111]">Encore stories</h1>
          <p className="text-[#565959] max-w-3xl mb-6">
            Real-world scenarios from Amazon's own returns pipeline. Each story runs through the
            Encore AI grading and deterministic decision engine — upload your own photo or use the
            pre-loaded product image to see the system in action.
          </p>

          {/* tabs */}
          <div className="flex gap-1 border-b" style={{ borderColor: '#D5D9D9' }}>
            {STORIES.map((s) => {
              const isActive = activeTab === s.id
              const TabIcon = s.Icon
              return (
                <button key={s.id} type="button" onClick={() => setActiveTab(s.id)}
                  className="px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all -mb-px rounded-t-md"
                  style={{
                    borderBottomColor: isActive ? '#FF9900' : 'transparent',
                    color: isActive ? '#0F1111' : '#565959',
                    backgroundColor: isActive ? '#fff8e0' : 'transparent',
                  }}>
                  <TabIcon size={16} />
                  {s.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* tab content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'seller' ? (
            <BatchScenario />
          ) : (
            <StoryScenario
              key={activeTab}
              story={STORIES.find(s => s.id === activeTab)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
