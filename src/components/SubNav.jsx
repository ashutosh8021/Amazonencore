import { useState } from 'react'
import { Menu } from 'lucide-react'
import SideDrawer from './SideDrawer.jsx'

const SECTION_LINKS = [
  { label: 'How it works', href: 'how-it-works' },
  { label: 'AI grading',   href: 'ai-decide' },
  { label: 'Impact',       href: 'impact' },
  { label: 'About Encore', href: 'trust' },
]

export default function SubNav({ onGetStarted, onDemoMode, onPersonas, onDashboard, onMarketplace, onScrollTo }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleAnchor(e, sectionId) {
    e.preventDefault()
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (onScrollTo) {
      onScrollTo(sectionId)
    }
  }

  return (
    <>
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onGetStarted={onGetStarted}
        onDemoMode={onDemoMode}
        onPersonas={onPersonas}
        onDashboard={onDashboard}
        onMarketplace={onMarketplace}
        onScrollTo={onScrollTo || ((id) => {
          const el = document.getElementById(id)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })}
      />

      <div style={{ backgroundColor: '#232F3E' }} className="w-full overflow-x-auto">
        <div className="max-w-[1500px] mx-auto px-4 py-2 flex items-center gap-5 whitespace-nowrap">

          {/* ≡ All — opens drawer */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold hover:text-[#FFD814] transition-colors flex-shrink-0"
          >
            <Menu size={18} />
            All
          </button>

          {/* Marketplace link */}
          {onMarketplace && (
            <button
              type="button"
              onClick={onMarketplace}
              className="text-white text-sm hover:text-[#FFD814] transition-colors flex-shrink-0 bg-transparent border-0 p-0 cursor-pointer"
            >
              Encore marketplace
            </button>
          )}

          {/* Section scroll links */}
          {SECTION_LINKS.map((link) => (
            <a
              key={link.label}
              href={`#${link.href}`}
              onClick={(e) => handleAnchor(e, link.href)}
              className="text-white text-sm hover:text-[#FFD814] transition-colors flex-shrink-0"
            >
              {link.label}
            </a>
          ))}

          {onPersonas && (
            <button
              type="button"
              onClick={onPersonas}
              className="text-sm font-semibold hover:text-[#FFD814] transition-colors flex-shrink-0"
              style={{ color: '#FF9900' }}
            >
              Encore stories
            </button>
          )}

          {onDashboard && (
            <button
              type="button"
              onClick={onDashboard}
              className="text-sm font-semibold hover:text-[#FFD814] transition-colors flex-shrink-0"
              style={{ color: '#FF9900' }}
            >
              Dashboard
            </button>
          )}

          {onGetStarted && (
            <button
              type="button"
              onClick={onGetStarted}
              className="text-sm font-semibold text-[#FFD814] hover:underline flex-shrink-0"
            >
              Sell a product
            </button>
          )}

          <span className="ml-auto hidden xl:block text-xs font-semibold tracking-wide text-[#FFD814]">
            Powered by Amazon Bedrock
          </span>
        </div>
      </div>
    </>
  )
}
