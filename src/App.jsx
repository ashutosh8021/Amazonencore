import { useCallback, useRef, useState } from 'react'
import Landing from './pages/Landing.jsx'
import Intake from './pages/Intake.jsx'
import Personas from './pages/Personas.jsx'
import Dashboard from './pages/Dashboard.jsx'
import MarketplacePage from './pages/MarketplacePage.jsx'
import CartSidebar from './components/CartSidebar.jsx'
import CheckoutModal from './components/CheckoutModal.jsx'

export default function App() {
  const [page, setPage] = useState('landing')
  const [demoMode, setDemoMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Cart state
  const [cartItems, setCartItems] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutProduct, setCheckoutProduct] = useState(null)

  const pendingScroll = useRef(null)

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)

  const goHome      = useCallback(() => { setPage('landing'); setDemoMode(false) }, [])
  const goIntake    = useCallback(() => { setDemoMode(false); setPage('intake') }, [])
  const goDemo      = useCallback(() => { setDemoMode(true);  setPage('intake') }, [])
  const goPersonas  = useCallback(() => setPage('personas'), [])
  const goDashboard = useCallback(() => setPage('dashboard'), [])
  const goMarket    = useCallback(() => { setSearchQuery(''); setPage('marketplace') }, [])
  const goSearch    = useCallback((q) => { setSearchQuery(q); setPage('marketplace') }, [])

  const addToCart = useCallback((product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((id) => {
    setCartItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQty = useCallback((id, delta) => {
    setCartItems(prev =>
      prev
        .map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter(i => i.qty > 0)
    )
  }, [])

  const [cartCheckout, setCartCheckout] = useState(null)

  const openCart    = useCallback(() => setCartOpen(true), [])
  const closeCart   = useCallback(() => setCartOpen(false), [])
  const openBuyNow  = useCallback((product) => setCheckoutProduct(product), [])
  const closeBuyNow = useCallback(() => setCheckoutProduct(null), [])

  const openCartCheckout = useCallback((data) => {
    setCartOpen(false)
    setCartCheckout(data)
  }, [])
  const closeCartCheckout = useCallback(() => {
    setCartCheckout(null)
    setCartItems([])   // clear cart after order placed
  }, [])

  const scrollTo = useCallback((sectionId) => {
    if (page === 'landing') {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      pendingScroll.current = sectionId
      setPage('landing')
      setDemoMode(false)
    }
  }, [page])

  const handleLandingMount = useCallback(() => {
    if (pendingScroll.current) {
      const id = pendingScroll.current
      pendingScroll.current = null
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(id)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 80)
      })
    }
  }, [])

  const nav = {
    onHome:           goHome,
    onGetStarted:     goIntake,
    onDemoMode:       goDemo,
    onPersonas:       goPersonas,
    onDashboard:      goDashboard,
    onMarketplace:    goMarket,
    onScrollTo:       scrollTo,
    onSearch:         goSearch,
    onAddToCart:      addToCart,
    onBuyNow:         openBuyNow,
    onOpenCart:       openCart,
    cartItems,
    cartCount,
    onRemoveFromCart: removeFromCart,
    onUpdateQty:      updateQty,
  }

  return (
    <>
      {page === 'intake' && (
        <Intake onBack={goHome} demoMode={demoMode} nav={nav} />
      )}
      {page === 'personas' && (
        <Personas onBack={goHome} nav={nav} />
      )}
      {page === 'dashboard' && (
        <Dashboard onBack={goHome} nav={nav} />
      )}
      {page === 'marketplace' && (
        <MarketplacePage onBack={goHome} nav={nav} searchQuery={searchQuery} />
      )}
      {page === 'landing' && (
        <Landing
          onGetStarted={goIntake}
          onDemoMode={goDemo}
          onPersonas={goPersonas}
          onDashboard={goDashboard}
          onMarketplace={goMarket}
          onScrollTo={scrollTo}
          onMount={handleLandingMount}
          onSearch={goSearch}
          cartCount={cartCount}
          onOpenCart={openCart}
        />
      )}

      <CartSidebar
        items={cartItems}
        isOpen={cartOpen}
        onClose={closeCart}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
        onCheckout={openCartCheckout}
      />

      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={closeBuyNow}
        />
      )}

      {cartCheckout && (
        <CheckoutModal
          cartItems={cartCheckout.items}
          cartDelivery={cartCheckout.delivery}
          cartDeliveryCost={cartCheckout.deliveryCost}
          cartTotal={cartCheckout.total}
          onClose={closeCartCheckout}
        />
      )}
    </>
  )
}
