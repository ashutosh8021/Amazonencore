import { RefreshCw, ShoppingBag } from 'lucide-react'

export default function ReturnPrevention({ onGetStarted, onMarketplace }) {
  return (
    <section style={{ backgroundColor: '#232F3E' }} className="py-14 px-4">
      <div className="max-w-[1140px] mx-auto">

        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#FF9900' }}>
            Predictive return prevention
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Encore closes the loop
          </h2>
          <p className="max-w-xl mx-auto text-base" style={{ color: '#CCCCCC' }}>
            Returns cost customers, sellers, and the planet. Encore steps in at both ends of the purchase lifecycle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Before you buy */}
          <div className="rounded-xl p-8" style={{ backgroundColor: '#131921', border: '1px solid #3d4f5c' }}>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: '#FF9900' }}
            >
              <ShoppingBag size={22} style={{ color: '#0F1111' }} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: '#FF9900' }}>
              Before you buy
            </p>
            <h3 className="text-xl font-bold text-white mb-3">Check Encore first</h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#CCCCCC' }}>
              A certified refurbished version may already be on Encore — AI-graded, honestly priced, with a
              30-day return window. Save money and skip the emissions of manufacturing new.
            </p>
            <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#232F3E' }}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: '#879596' }}>
                Why it works
              </p>
              <div className="space-y-2 text-sm" style={{ color: '#CCCCCC' }}>
                <p>→ AI-verified condition with confidence score</p>
                <p>→ Honest flaws disclosed upfront — no surprises</p>
                <p>→ Priced to reflect reality, not wishful thinking</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onMarketplace}
              style={{ backgroundColor: '#FF9900', color: '#0F1111' }}
              className="w-full py-3 rounded-full font-bold text-sm hover:brightness-95 transition-all"
            >
              Browse certified refurbished
            </button>
          </div>

          {/* Before you discard */}
          <div className="rounded-xl p-8" style={{ backgroundColor: '#131921', border: '1px solid #3d4f5c' }}>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: '#FFD814' }}
            >
              <RefreshCw size={22} style={{ color: '#0F1111' }} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: '#FFD814' }}>
              Before you discard
            </p>
            <h3 className="text-xl font-bold text-white mb-3">Give it a second life</h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#CCCCCC' }}>
              Before returning or throwing away a product, let Encore assess it. In seconds, AI grades the
              condition and routes it to the best possible outcome — no guesswork required.
            </p>
            <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#232F3E' }}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: '#879596' }}>
                Possible outcomes
              </p>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm" style={{ color: '#CCCCCC' }}>
                <p>✓ Resell for cash</p>
                <p>✓ Refurbish for more</p>
                <p>✓ Donate for green credits</p>
                <p>✓ Trade-in for Amazon Pay</p>
                <p>✓ Recycle responsibly</p>
                <p>✓ Zero waste by default</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onGetStarted}
              style={{ backgroundColor: '#FFD814', color: '#0F1111' }}
              className="w-full py-3 rounded-full font-bold text-sm hover:brightness-95 transition-all"
            >
              Grade your product now
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
