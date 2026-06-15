import { CheckCircle, Leaf, Upload, ScanLine, GitBranch } from 'lucide-react'
import EncoreMark from './EncoreMark.jsx'

const FLOW_STEPS = [
  { icon: Upload,    title: 'Snap',   body: 'A photo of the returned or unused item.' },
  { icon: ScanLine,  title: 'Grade',  body: 'AI reads condition, flaws and confidence.' },
  { icon: GitBranch, title: 'Route',  body: 'Value-vs-cost math picks the best outcome.' },
  { icon: Leaf,      title: 'Reward', body: 'A listing if it sells — green credits if not.' },
]

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

            {/* Right — Snap → Grade → Route → Reward flow */}
            <div className="hidden md:block w-[320px] lg:w-[360px] flex-shrink-0">
              <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 22px 18px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <p style={{ color: '#FF9900', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 18 }}>
                  How Encore works
                </p>

                <div className="relative">
                  {/* connecting line behind the icon badges */}
                  <div style={{ position: 'absolute', left: 21, top: 22, bottom: 22, width: 2, backgroundColor: 'rgba(255,255,255,0.12)' }} />

                  <div className="flex flex-col gap-5">
                    {FLOW_STEPS.map((step, i) => {
                      const Icon = step.icon
                      return (
                        <div key={step.title} className="flex items-start gap-4 relative">
                          <div
                            className="flex-shrink-0 flex items-center justify-center"
                            style={{
                              width: 44, height: 44, borderRadius: '50%',
                              backgroundColor: '#0A4F6E',
                              border: '2px solid rgba(255,153,0,0.45)',
                              color: '#FF9900',
                            }}
                          >
                            <Icon size={20} />
                          </div>
                          <div className="pt-1">
                            <div className="flex items-center gap-2">
                              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{step.title}</span>
                              <span style={{ color: '#5B7A8C', fontSize: 11, fontWeight: 600 }}>Step {i + 1}</span>
                            </div>
                            <p style={{ color: '#A8C7DA', fontSize: 12.5, lineHeight: 1.5, marginTop: 2 }}>{step.body}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <p style={{ color: '#87CEEB', fontSize: 11.5, textAlign: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                  Photo to decision in seconds — all inside Amazon.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </>
  )
}
