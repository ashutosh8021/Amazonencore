import { useState } from 'react'
import { CheckCircle2, Loader2, ShieldCheck, Star, Truck, Eye, ExternalLink } from 'lucide-react'
import { publishListing } from '../lib/api.js'

/* ── colour map ──────────────────────────────────────────────────── */

const GRADE_COLOR = {
  'Like New':     { color: '#067D62', bg: '#e6f4ea' },
  'Very Good':    { color: '#007185', bg: '#e0f0f3' },
  'Good':         { color: '#c45500', bg: '#fff3e0' },
  'Acceptable':   { color: '#b12704', bg: '#fde8d8' },
  'Not Sellable': { color: '#cc0c39', bg: '#fce8e8' },
}

export default function ListingPreview({ listing, gradeResult, decideResult, imageUrl, originalPrice, category }) {
  if (!listing) return null

  const [listed, setListed] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState(null)

  const grade = listing.conditionLabel || gradeResult?.grade || 'Good'
  const cfg = GRADE_COLOR[grade] ?? GRADE_COLOR['Good']

  const sugPrice = Number(listing.suggestedPrice ?? 0)
  const resaleVal = Number(decideResult?.expectedResaleValue ?? 0)
  const origPrice = Number(originalPrice ?? 0)
  const price = sugPrice > 0 ? sugPrice : (resaleVal > 0 ? resaleVal : Math.round(origPrice * 0.7))

  const discount = origPrice > 0 && price < origPrice
    ? Math.round(((origPrice - price) / origPrice) * 100)
    : 0
  const confidence = gradeResult?.confidence ?? 90

  async function handleList() {
    setPublishing(true)
    setError(null)
    try {
      // get base64 from the image (if it's a data URL or blob URL)
      let imageBase64 = null
      if (imageUrl && imageUrl.startsWith('data:')) {
        imageBase64 = imageUrl.split(',')[1]
      } else if (imageUrl) {
        try {
          const res = await fetch(imageUrl)
          const blob = await res.blob()
          imageBase64 = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result.split(',')[1])
            reader.readAsDataURL(blob)
          })
        } catch { /* skip image if fetch fails */ }
      }

      await publishListing({
        title: listing.title,
        description: listing.description,
        conditionLabel: grade,
        suggestedPrice: price,
        originalPrice: origPrice,
        category: category || 'General',
        grade: grade,
        confidence: confidence,
        observations: gradeResult?.observations || [],
        imageBase64,
        co2SavedKg: gradeResult?.co2SavedKgEstimate || 0,
      })
      setListed(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden encore-fade-in"
      style={{ borderColor: '#D5D9D9', animationDelay: '0.25s' }}>

      {/* header */}
      <div className="px-5 py-3 border-b flex items-center justify-between flex-wrap gap-2"
        style={{ borderColor: '#D5D9D9', backgroundColor: '#F7F8F8' }}>
        <div className="flex items-center gap-2">
          <Eye size={14} style={{ color: '#879596' }} />
          <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#879596' }}>
            Listing preview
          </span>
        </div>
        <span className="text-xs" style={{ color: '#565959' }}>
          This is how your item appears on the Encore marketplace
        </span>
      </div>

      {/* product card body */}
      <div className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row gap-5">

          {/* product image */}
          <div className="sm:w-[200px] flex-shrink-0">
            <div className="h-[200px] rounded-lg border overflow-hidden relative"
              style={{ borderColor: '#D5D9D9', backgroundColor: '#F7F8F8' }}>
              {imageUrl ? (
                <img src={imageUrl} alt={listing.title}
                  className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#879596] text-sm">
                  No image
                </div>
              )}
              <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                {grade}
              </span>
              <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#e6f4ea', color: '#067D62' }}>
                <ShieldCheck size={10} />
                Encore Verified
              </span>
            </div>
          </div>

          {/* product details */}
          <div className="flex-1 min-w-0 flex flex-col gap-2.5">

            <h3 className="text-lg font-medium leading-snug hover:text-[#C7511F] cursor-pointer"
              style={{ color: '#007185' }}>
              {listing.title}
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4].map(n => (
                  <Star key={n} size={13} fill="#FFA41C" stroke="#FFA41C" />
                ))}
                <Star size={13} fill="none" stroke="#FFA41C" />
              </div>
              <span className="text-xs" style={{ color: '#007185' }}>
                Encore verified · {confidence}% condition confidence
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                {grade}
              </span>
              {category && (
                <span className="text-xs px-2.5 py-0.5 rounded-full border"
                  style={{ borderColor: '#D5D9D9', color: '#565959' }}>
                  {category}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 flex-wrap mt-1">
              {discount > 0 && (
                <span className="text-sm font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: '#cc0c39', color: '#fff' }}>
                  {discount}% off
                </span>
              )}
              <span className="text-2xl font-medium" style={{ color: '#0F1111' }}>
                ₹{price.toLocaleString('en-IN')}
              </span>
              {origPrice > 0 && origPrice !== price && (
                <span className="text-sm text-[#565959] line-through">
                  M.R.P.: ₹{origPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <p className="text-sm text-[#565959] leading-relaxed mt-1">
              {listing.description}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <Truck size={14} style={{ color: '#067D62' }} />
              <span className="text-sm" style={{ color: '#067D62' }}>
                <strong>FREE delivery</strong> by Amazon
              </span>
            </div>

            {gradeResult?.observations?.length > 0 && (
              <div className="mt-2 border-t pt-3" style={{ borderColor: '#E3E6E6' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#879596] mb-2">
                  Condition notes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {gradeResult.observations.map((obs, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full border"
                      style={{ borderColor: '#D5D9D9', color: '#565959', backgroundColor: '#fafafa' }}>
                      {obs}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* seller action */}
        <div className="mt-5">
          {!listed ? (
            <div className="flex flex-col gap-2">
              <button type="button"
                onClick={handleList}
                disabled={publishing}
                className="w-full py-3.5 rounded-full font-bold text-sm transition-all hover:brightness-95 flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: '#FFD814', color: '#0F1111' }}>
                {publishing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Publishing to marketplace...
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} />
                    List this item on Encore marketplace
                  </>
                )}
              </button>
              {error && (
                <p className="text-xs text-center" style={{ color: '#cc0c39' }}>{error}</p>
              )}
            </div>
          ) : (
            <div className="rounded-lg p-4 flex items-center gap-3 encore-fade-in"
              style={{ backgroundColor: '#e6f4ea', border: '1px solid #067D62' }}>
              <CheckCircle2 size={22} style={{ color: '#067D62' }} />
              <div>
                <p className="font-bold text-sm" style={{ color: '#067D62' }}>
                  Listed successfully on Encore marketplace
                </p>
                <p className="text-xs text-[#565959] mt-0.5">
                  Your item is now live at ₹{price.toLocaleString('en-IN')} with the "{grade}" condition badge.
                  Visit the marketplace to see it alongside other Encore listings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* trust footer */}
      <div className="px-5 py-3 border-t flex items-center justify-between flex-wrap gap-2"
        style={{ borderColor: '#D5D9D9', backgroundColor: '#f0faf5' }}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} style={{ color: '#067D62' }} />
          <span className="text-xs font-semibold" style={{ color: '#067D62' }}>
            Encore Verified listing — condition graded by AI, priced by decision engine, stored in Supabase
          </span>
        </div>
      </div>
    </div>
  )
}
