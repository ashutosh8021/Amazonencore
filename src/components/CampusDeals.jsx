import { useRef } from 'react'
import { MapPin, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'
import { listings, DEMO_LOCATION } from '../data/listings.js'

const CONDITION_COLOR = {
  'Like New':   { color: '#067D62', bg: '#e6f4ea' },
  'Very Good':  { color: '#007185', bg: '#e0f0f3' },
  'Good':       { color: '#c45500', bg: '#fff3e0' },
  'Acceptable': { color: '#B12704', bg: '#fde8d8' },
}

// Curated set with real product images so the homepage rail looks like a live store.
const DEALS = listings.filter(l => l.image && l.price > 0).slice(0, 12)

export default function CampusDeals({ onProductClick, onMarketplace }) {
  const scroller = useRef(null)

  function nudge(dir) {
    scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }

  if (!DEALS.length) return null

  return (
    <section className="px-4 pt-3 pb-2">
      <div className="max-w-[1500px] mx-auto rounded-md bg-white p-5" style={{ border: '1px solid #D5D9D9' }}>
        {/* Header */}
        <div className="flex items-end justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <MapPin size={20} style={{ color: '#067D62' }} />
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#0F1111' }}>
              Encore Campus deals — {DEMO_LOCATION}
            </h2>
          </div>
          <button
            type="button"
            onClick={onMarketplace}
            className="text-sm font-semibold hover:underline flex-shrink-0 whitespace-nowrap"
            style={{ color: '#007185' }}
          >
            See all deals ›
          </button>
        </div>
        <p className="text-sm text-[#565959] mb-4">
          Returned and pre-owned items at a discount — picked up hand-to-hand on campus, with verified condition.
        </p>

        {/* Scroll rail */}
        <div className="relative">
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Scroll left"
            className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow items-center justify-center border hover:bg-[#F3F3F3] transition-colors"
            style={{ borderColor: '#D5D9D9' }}
          >
            <ChevronLeft size={18} />
          </button>

          <div
            ref={scroller}
            className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
          >
            {DEALS.map((deal) => {
              const cfg = CONDITION_COLOR[deal.conditionGrade] ?? CONDITION_COLOR['Good']
              const discount = deal.originalPrice > 0 && deal.price < deal.originalPrice
                ? Math.round((1 - deal.price / deal.originalPrice) * 100)
                : 0
              return (
                <button
                  key={deal.id}
                  type="button"
                  onClick={() => onProductClick?.(deal)}
                  className="text-left flex-shrink-0 w-[180px] rounded-md border bg-white p-3 hover:shadow-md transition-shadow"
                  style={{ borderColor: '#E7E7E7' }}
                >
                  {/* Image */}
                  <div className="h-[150px] rounded-md overflow-hidden border relative mb-2.5" style={{ borderColor: '#F0F0F0' }}>
                    <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                    <span
                      className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                      {deal.conditionGrade}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-sm leading-snug line-clamp-2 mb-1.5 min-h-[2.4em]" style={{ color: '#0F1111' }}>
                    {deal.title}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    {discount > 0 && (
                      <span className="text-xs font-bold" style={{ color: '#CC0C39' }}>
                        {discount}% off
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-lg font-medium" style={{ color: '#0F1111' }}>
                      ₹{deal.price.toLocaleString('en-IN')}
                    </span>
                    {deal.originalPrice > 0 && (
                      <span className="text-xs text-[#565959] line-through">
                        ₹{deal.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Verified line */}
                  <div className="flex items-center gap-1 mt-2">
                    <ShieldCheck size={11} style={{ color: '#067D62' }} />
                    <span className="text-[11px]" style={{ color: '#067D62' }}>
                      Encore Verified · {deal.conditionScore}/100
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Scroll right"
            className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow items-center justify-center border hover:bg-[#F3F3F3] transition-colors"
            style={{ borderColor: '#D5D9D9' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}
