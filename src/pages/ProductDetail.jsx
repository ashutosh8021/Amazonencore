import { useState } from 'react'
import { ArrowLeft, ShieldCheck, ShoppingCart, Zap, Star, Truck, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

const CONDITION_COLOR = {
  'Like New':   { color: '#067D62', bg: '#e6f4ea' },
  'Very Good':  { color: '#007185', bg: '#e0f0f3' },
  'Good':       { color: '#c45500', bg: '#fff3e0' },
  'Acceptable': { color: '#B12704', bg: '#fde8d8' },
}

export default function ProductDetail({ product, onBack, onAddToCart, onBuyNow }) {
  const fallback = `https://picsum.photos/seed/${product.id}/600/600`
  const mainImg = product.image ?? fallback
  const extras = Array.isArray(product.additional_images) ? product.additional_images : []
  const allImgs = [mainImg, ...extras].filter(Boolean)

  const [activeIdx, setActiveIdx] = useState(0)
  const [imgSrc, setImgSrc] = useState(allImgs[0] ?? fallback)
  const [added, setAdded] = useState(false)

  const cfg = CONDITION_COLOR[product.conditionGrade] ?? CONDITION_COLOR['Good']
  const discount = product.originalPrice > 0 && product.price < product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  function goTo(i) {
    setActiveIdx(i)
    setImgSrc(allImgs[i] ?? fallback)
  }

  function prev() { goTo((activeIdx - 1 + allImgs.length) % allImgs.length) }
  function next() { goTo((activeIdx + 1) % allImgs.length) }

  function handleAddToCart() {
    setAdded(true)
    if (onAddToCart) onAddToCart(product)
    setTimeout(() => setAdded(false), 1800)
  }

  const observations = product.conditionReport?.observations ?? []
  const summary = product.conditionReport?.summary ?? ''
  const confidence = product.conditionReport?.confidence ?? product.conditionScore ?? 80

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-xs text-[#565959] mb-3 flex items-center gap-1.5 flex-wrap">
        <button type="button" onClick={onBack} className="hover:underline" style={{ color: '#007185' }}>
          Encore marketplace
        </button>
        <span>›</span>
        <span className="text-[#0F1111] font-medium line-clamp-1">{product.title}</span>
      </div>

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:text-[#C7511F] transition-colors"
        style={{ color: '#007185' }}
      >
        <ArrowLeft size={16} />
        Back to marketplace
      </button>

      <div className="grid md:grid-cols-[1fr_380px] gap-6">
        {/* Left — image + details */}
        <div className="space-y-5">
          {/* Image gallery */}
          <div className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: '#D5D9D9' }}>
            <div className="relative" style={{ height: 420 }}>
              <img
                src={imgSrc}
                alt={product.title}
                onError={() => setImgSrc(fallback)}
                className="w-full h-full object-contain p-4"
              />
              {/* Badges */}
              <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                {product.conditionGrade}
              </span>
              <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#e6f4ea', color: '#067D62' }}>
                <ShieldCheck size={12} /> Encore Verified
              </span>
              {/* Prev / next arrows */}
              {allImgs.length > 1 && (
                <>
                  <button type="button" onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center border transition-colors hover:bg-[#F3F3F3]"
                    style={{ borderColor: '#D5D9D9' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center border transition-colors hover:bg-[#F3F3F3]"
                    style={{ borderColor: '#D5D9D9' }}>
                    <ChevronRight size={18} />
                  </button>
                  <span className="absolute bottom-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                    {activeIdx + 1}/{allImgs.length}
                  </span>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {allImgs.length > 1 && (
              <div className="flex gap-2 p-3 border-t overflow-x-auto" style={{ borderColor: '#D5D9D9' }}>
                {allImgs.map((src, i) => (
                  <button key={i} type="button" onClick={() => goTo(i)}
                    className="w-16 h-16 rounded border flex-shrink-0 overflow-hidden transition-all"
                    style={{ borderColor: activeIdx === i ? '#FF9900' : '#D5D9D9', borderWidth: activeIdx === i ? 2 : 1 }}>
                    <img src={src} alt="" className="w-full h-full object-cover" onError={() => {}} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Condition report */}
          <div className="rounded-lg border bg-white p-5" style={{ borderColor: '#D5D9D9' }}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} style={{ color: '#067D62' }} />
              <h3 className="font-bold text-[#0F1111]">Encore condition report</h3>
              <span className="text-xs text-[#565959]">AI-graded · {confidence}% confidence</span>
            </div>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                {product.conditionGrade}
              </span>
              <span className="text-sm text-[#565959]">Score: {product.conditionScore}/100</span>
            </div>

            {observations.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#879596] mb-2">Observations</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {observations.map((obs, i) => {
                    const negWords = ['scratch', 'crack', 'damage', 'worn', 'tear', 'dent', 'bend', 'broken', 'missing', 'stain']
                    const isNeg = negWords.some(w => obs.toLowerCase().includes(w))
                    return (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        {isNeg
                          ? <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#c45500' }} />
                          : <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#067D62' }} />}
                        <span className="text-[#565959]">{obs}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {summary && (
              <div className="rounded-md border p-4" style={{ borderColor: '#D5D9D9', backgroundColor: '#FAFAFA' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#879596] mb-1">Summary</p>
                <p className="text-sm text-[#565959] leading-relaxed">{summary}</p>
              </div>
            )}

            <p className="text-xs text-[#879596] mt-3">
              AI-generated by Amazon Encore. Reviewed before listing.
            </p>
          </div>
        </div>

        {/* Right — price + buy */}
        <div className="space-y-4">
          {/* Product info card */}
          <div className="rounded-lg border bg-white p-5" style={{ borderColor: '#D5D9D9' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#007185' }}>
              {product.category}
            </p>
            <h1 className="text-xl font-medium leading-snug mb-3" style={{ color: '#0F1111' }}>
              {product.title}
            </h1>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[1,2,3,4].map(n => <Star key={n} size={13} fill="#FFA41C" stroke="#FFA41C" />)}
                <Star size={13} fill="none" stroke="#FFA41C" />
              </div>
              <span className="text-xs" style={{ color: '#007185' }}>
                Encore verified · {confidence}% confidence
              </span>
            </div>

            <div className="border-t pt-4" style={{ borderColor: '#E3E6E6' }}>
              {discount > 0 && (
                <span className="inline-block text-sm font-semibold px-2 py-0.5 rounded mb-2"
                  style={{ backgroundColor: '#cc0c39', color: '#fff' }}>
                  {discount}% off
                </span>
              )}
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-medium" style={{ color: '#0F1111' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > 0 && (
                  <span className="text-sm text-[#565959] line-through">
                    M.R.P.: ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Truck size={14} style={{ color: '#067D62' }} />
                <span className="text-sm font-semibold" style={{ color: '#067D62' }}>
                  FREE delivery by Amazon
                </span>
              </div>
              <p className="text-xs text-[#565959] mt-1">30-day return window. Backed by Encore.</p>
            </div>
          </div>

          {/* Buy box */}
          <div className="rounded-lg border bg-white p-5 space-y-3" style={{ borderColor: '#D5D9D9' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                {product.conditionGrade}
              </span>
              <span className="text-xs text-[#565959]">condition</span>
            </div>

            {product.price > 0 ? (
              <>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    backgroundColor: added ? '#067D62' : '#FFD814',
                    color: added ? '#fff' : '#0F1111',
                  }}
                >
                  <ShoppingCart size={15} />
                  {added ? 'Added to cart' : 'Add to cart'}
                </button>
                <button
                  type="button"
                  onClick={() => onBuyNow?.(product)}
                  className="w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor: '#FF9900', color: '#fff' }}
                >
                  <Zap size={15} />
                  Buy now
                </button>
              </>
            ) : (
              <p className="text-sm text-[#565959] text-center py-2">Price on request</p>
            )}

            <div className="pt-2 border-t space-y-1.5" style={{ borderColor: '#E3E6E6' }}>
              <div className="flex items-center gap-2 text-xs text-[#565959]">
                <ShieldCheck size={12} style={{ color: '#067D62' }} />
                AI-verified condition
              </div>
              <div className="flex items-center gap-2 text-xs text-[#565959]">
                <CheckCircle2 size={12} style={{ color: '#067D62' }} />
                Honest pricing — no markup
              </div>
              <div className="flex items-center gap-2 text-xs text-[#565959]">
                <Truck size={12} style={{ color: '#067D62' }} />
                Secure Amazon fulfilment
              </div>
            </div>
          </div>

          {/* Encore badge */}
          <div className="rounded-lg border p-4" style={{ borderColor: '#D5D9D9', backgroundColor: '#f0faf5' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#067D62' }}>
              Powered by Amazon Bedrock
            </p>
            <p className="text-xs text-[#565959] leading-relaxed">
              This listing was AI-graded by Encore — condition, observations, and price are
              generated by Amazon Bedrock, not a seller estimate.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
