import { CheckCircle, Heart, Leaf, TrendingUp } from 'lucide-react'
import EncoreMark from './EncoreMark.jsx'

export default function Hero({ onGetStarted, onDemoMode, onMarketplace }) {

  return (
    <>
      {/* ── Program breadcrumb strip ─────────────────────────────── */}
      <div style={{ backgroundColor: '#0F1111', borderBottom: '1px solid #1E2A35' }}>
        <div className="max-w-[1500px] mx-auto px-4 py-1.5 flex items-center gap-2 text-xs">
          <span style={{ color: '#879596' }}>amazon.in</span>
          <span style={{ color: '#4B5563' }}>/</span>
          <span style={{ color: '#FF9900', fontWeight: 600 }}>encore</span>
          <span className="hidden sm:inline" style={{ color: '#4B5563' }}>·</span>
          <span className="hidden sm:inline" style={{ color: '#879596' }}>
            AI-powered second-life commerce program
          </span>
          <span className="ml-auto hidden md:flex items-center gap-1.5" style={{ color: '#067D62', fontWeight: 600 }}>
            <Leaf size={11} />
            Sustainability initiative
          </span>
        </div>
      </div>

      {/* ── Full-width hero banner ───────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(120deg, #001C2E 0%, #003049 45%, #0A4F6E 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* orange glow backdrop */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(ellipse at 75% 50%, rgba(255,153,0,0.10) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div className="max-w-[1500px] mx-auto px-6 py-10 md:py-14 relative">
          <div className="flex flex-col md:flex-row md:items-center gap-8 lg:gap-12">

            {/* Left — text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <EncoreMark size={20} color="#FF9900" />
                <span style={{ color: '#FF9900', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Amazon Encore
                </span>
                <span style={{ backgroundColor: 'rgba(255,153,0,0.15)', color: '#FF9900', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(255,153,0,0.3)' }}>
                  New program
                </span>
              </div>

              <h1 style={{ color: '#fff', fontSize: 'clamp(26px, 4vw, 46px)', fontWeight: 700, lineHeight: 1.18, marginBottom: 14 }}>
                Give your product<br className="hidden sm:block" /> a second life
              </h1>

              <p style={{ color: '#A8C7DA', fontSize: 15, lineHeight: 1.65, marginBottom: 24, maxWidth: 500 }}>
                Encore grades returned and unused products with AI, shows the value-versus-cost math,
                and routes each item to resale, donation, or recycling — all inside Amazon.
              </p>

              <div className="flex gap-3 flex-wrap mb-6">
                <button type="button" onClick={onGetStarted}
                  style={{ backgroundColor: '#FFD814', color: '#0F1111', padding: '11px 32px', borderRadius: 6, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}
                  className="hover:brightness-95 transition-all">
                  Sell a product
                </button>
                <button type="button" onClick={onDemoMode}
                  style={{ backgroundColor: 'transparent', color: '#fff', padding: '11px 32px', borderRadius: 6, fontWeight: 600, fontSize: 15, border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}
                  className="hover:border-white/60 transition-all">
                  See it in action
                </button>
              </div>

              <div className="flex flex-wrap gap-5 mb-4">
                {['Free to list', 'Instant AI grade', 'Transparent math'].map(label => (
                  <span key={label} style={{ color: '#A8C7DA', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} style={{ color: '#4ADE80' }} />
                    {label}
                  </span>
                ))}
              </div>

              <button type="button" onClick={onMarketplace}
                style={{ color: '#48CAE4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0 }}
                className="hover:underline">
                Explore Encore deals →
              </button>
            </div>

            {/* Right — contrasting routing cards (the key demo moment) */}
            <div className="hidden md:flex flex-col gap-3 w-[300px] lg:w-[340px] flex-shrink-0">

              {/* AirPods Pro → Resell */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <p style={{ color: '#87CEEB', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>
                      High-value item
                    </p>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>AirPods Pro (2nd gen)</p>
                    <p style={{ color: '#87CEEB', fontSize: 12 }}>₹24,900 · Grade: Very Good</p>
                  </div>
                  <span style={{ backgroundColor: '#e6f4ea', color: '#067D62', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    Very Good
                  </span>
                </div>
                <div style={{ backgroundColor: 'rgba(6,125,98,0.22)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TrendingUp size={18} style={{ color: '#4ADE80', flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#4ADE80', fontWeight: 800, fontSize: 17 }}>Resell at ₹12,500</p>
                    <p style={{ color: '#A8C7DA', fontSize: 11 }}>₹12,100 net after processing</p>
                  </div>
                </div>
              </div>

              {/* Running shoe → Donate */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <p style={{ color: '#87CEEB', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>
                      The long-tail case
                    </p>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Running shoe (used)</p>
                    <p style={{ color: '#87CEEB', fontSize: 12 }}>₹500 · Grade: Good</p>
                  </div>
                  <span style={{ backgroundColor: '#fff3e0', color: '#c45500', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    Good
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#A8C7DA', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Resale ₹200 − cost ₹250 =</span>
                  <span style={{ color: '#F87171', fontWeight: 700 }}>−₹50</span>
                </div>
                <div style={{ backgroundColor: 'rgba(255,153,0,0.18)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Heart size={18} style={{ color: '#FF9900', flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#FFD814', fontWeight: 800, fontSize: 17 }}>Donate + 24 credits</p>
                    <p style={{ color: '#A8C7DA', fontSize: 11 }}>Relisting would lose ₹50</p>
                  </div>
                </div>
              </div>

              <p style={{ color: '#87CEEB', fontSize: 11, textAlign: 'center', marginTop: 2 }}>
                Encore sees both. Only one choice is actually right.
              </p>
            </div>

          </div>
        </div>
      </div>

    </>
  )
}
