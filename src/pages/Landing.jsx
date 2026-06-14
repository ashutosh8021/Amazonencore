import { useEffect } from 'react'
import TopNav from '../components/TopNav.jsx'
import SubNav from '../components/SubNav.jsx'
import Hero from '../components/Hero.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import AIDecide from '../components/AIDecide.jsx'
import Impact from '../components/Impact.jsx'
import Trust from '../components/Trust.jsx'
import FinalCTA from '../components/FinalCTA.jsx'
import Footer from '../components/Footer.jsx'

export default function Landing({ onGetStarted, onDemoMode, onPersonas, onDashboard, onMarketplace, onScrollTo, onMount, onSearch, cartCount = 0, onOpenCart }) {
  useEffect(() => {
    if (onMount) onMount()
  }, [onMount])

  return (
    <div style={{ color: '#0F1111', backgroundColor: '#eaeded', minHeight: '100vh' }}>
      <TopNav onPrimaryAction={onGetStarted} primaryLabel="Sell with Encore" onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onSearch={onSearch} cartCount={cartCount} onOpenCart={onOpenCart} />
      <SubNav
        onGetStarted={onGetStarted}
        onDemoMode={onDemoMode}
        onPersonas={onPersonas}
        onDashboard={onDashboard}
        onMarketplace={onMarketplace}
        onScrollTo={onScrollTo}
      />
      <Hero onGetStarted={onGetStarted} onDemoMode={onDemoMode} onMarketplace={onMarketplace} onDashboard={onDashboard} />
      <HowItWorks />
      <AIDecide />
      <Impact />
      <Trust />
      <FinalCTA onGetStarted={onGetStarted} />
      <Footer />
    </div>
  )
}
