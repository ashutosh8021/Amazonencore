import { ArrowLeft } from 'lucide-react'
import TopNav from '../components/TopNav.jsx'
import SubNav from '../components/SubNav.jsx'
import Marketplace from '../components/Marketplace.jsx'

export default function MarketplacePage({ onBack, nav = {}, searchQuery = '' }) {
  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh' }}>
      <TopNav onPrimaryAction={nav.onGetStarted} primaryLabel="Sell with Encore" onHome={onBack} onSearch={nav.onSearch} cartCount={nav.cartCount} onOpenCart={nav.onOpenCart} onSignIn={nav.onSignIn} />
      <SubNav
        onGetStarted={nav.onGetStarted}
        onDemoMode={nav.onDemoMode}
        onPersonas={nav.onPersonas}
        onDashboard={nav.onDashboard}
        onMarketplace={nav.onMarketplace}
        onScrollTo={nav.onScrollTo}
      />

      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <div className="text-sm text-[#565959] mb-4">Amazon Encore › Marketplace</div>

        <div className="rounded-md border bg-white p-5 mb-6" style={{ borderColor: '#D5D9D9' }}>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm hover:text-[#C7511F] transition-colors mb-3"
            style={{ color: '#007185' }}
          >
            <ArrowLeft size={16} />
            Back to Encore home
          </button>
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#0F1111' }}>
            Encore marketplace
          </h1>
          <p className="text-[#565959] max-w-2xl">
            AI-verified listings from returned and pre-owned products. Every item graded by Encore
            with a visible condition report — honest about flaws, priced to reflect reality.
          </p>
        </div>

        <Marketplace searchQuery={searchQuery} onAddToCart={nav.onAddToCart} onBuyNow={nav.onBuyNow} />
      </div>
    </div>
  )
}
