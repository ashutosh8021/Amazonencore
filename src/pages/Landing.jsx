import { useEffect } from 'react'
import TopNav from '../components/TopNav.jsx'
import SubNav from '../components/SubNav.jsx'
import Hero from '../components/Hero.jsx'
import CampusDeals from '../components/CampusDeals.jsx'
import CategoryTiles from '../components/CategoryTiles.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import AIDecide from '../components/AIDecide.jsx'
import Impact from '../components/Impact.jsx'
import Trust from '../components/Trust.jsx'
import ReturnPrevention from '../components/ReturnPrevention.jsx'
import FinalCTA from '../components/FinalCTA.jsx'
import Footer from '../components/Footer.jsx'

export default function Landing({ onGetStarted, onDemoMode, onPersonas, onDashboard, onMarketplace, onCampus, onProduct, onScrollTo, onMount, onSearch, onSignIn, onMyListings, onProfile, cartCount = 0, onOpenCart }) {
  useEffect(() => {
    if (onMount) onMount()
  }, [onMount])

  return (
    <div style={{ color: '#0F1111', backgroundColor: '#eaeded', minHeight: '100vh' }}>
      <TopNav onPrimaryAction={onGetStarted} primaryLabel="Sell with Encore" onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onSearch={onSearch} cartCount={cartCount} onOpenCart={onOpenCart} onSignIn={onSignIn} onMyListings={onMyListings} onProfile={onProfile} />
      <SubNav
        onGetStarted={onGetStarted}
        onDemoMode={onDemoMode}
        onPersonas={onPersonas}
        onDashboard={onDashboard}
        onMarketplace={onMarketplace}
        onCampus={onCampus}
        onScrollTo={onScrollTo}
        onSignIn={onSignIn}
      />
      <Hero onGetStarted={onGetStarted} onDemoMode={onDemoMode} onMarketplace={onMarketplace} onDashboard={onDashboard} />
      <CampusDeals onProductClick={onProduct} onMarketplace={onCampus || onMarketplace} />
      <CategoryTiles onProductClick={onProduct} onMarketplace={onMarketplace} />
      <HowItWorks />
      <AIDecide />
      <Impact />
      <Trust />
      <ReturnPrevention onGetStarted={onGetStarted} onMarketplace={onMarketplace} />
      <FinalCTA onGetStarted={onGetStarted} />
      <Footer />
    </div>
  )
}
