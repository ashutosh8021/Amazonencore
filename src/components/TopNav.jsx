import { useState } from 'react'
import { ChevronDown, MapPin, Menu, Search, ShoppingCart } from 'lucide-react'

export default function TopNav({ onPrimaryAction, primaryLabel = 'Sell with Encore', onHome, onSearch, cartCount = 0, onOpenCart }) {
  const [query, setQuery] = useState('')

  function handleSearch() {
    if (query.trim() && onSearch) onSearch(query.trim())
  }
  return (
    <nav
      style={{ backgroundColor: '#131921' }}
      className="sticky top-0 z-50 shadow-[0_2px_6px_rgba(15,17,17,0.24)]"
    >
      <div className="max-w-[1500px] mx-auto px-4 py-2">
        <div className="flex items-center gap-2 lg:gap-3">

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2 text-white"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Amazon.in logo — HTML text (sharp) + SVG smile only */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); if (onHome) onHome() }}
            className="flex-shrink-0 select-none border border-transparent hover:border-white rounded px-1 py-0.5 transition-colors inline-block"
            aria-label="Amazon Encore home"
          >
            {/* wordmark row — same font weight, baseline aligned */}
            <div className="flex items-baseline leading-none">
              <span style={{
                color: 'white',
                fontFamily: "'Arial Black', Arial, sans-serif",
                fontWeight: 900,
                fontSize: '22px',
                letterSpacing: '-0.5px',
                lineHeight: 1,
              }}>
                amazon
              </span>
              <span style={{
                color: '#FF9900',
                fontFamily: "'Arial Black', Arial, sans-serif",
                fontWeight: 900,
                fontSize: '13px',
                lineHeight: 1,
                marginLeft: '2px',
              }}>
                .in
              </span>
            </div>
            {/* smile — reference 200×70 viewBox squished to 18px tall for shallow arc */}
            <svg viewBox="0 0 200 70" width="110" height="18" preserveAspectRatio="none" style={{ display: 'block', marginTop: '1px' }} aria-hidden="true">
              <path d="M 5 34 Q 95 60 162 30" stroke="#FF9900" strokeWidth="7" fill="none" strokeLinecap="round"/>
              <path d="M 148 36 Q 158 28 164 14 Q 160 30 170 36 Z" fill="#FF9900"/>
            </svg>
          </a>

          {/* Location */}
          <div className="hidden lg:flex flex-col min-w-fit px-1 border border-transparent hover:border-white rounded px-1 py-0.5 transition-colors cursor-pointer">
            <span className="text-[11px] text-[#CCCCCC]">Deliver to</span>
            <span className="text-sm font-bold text-white flex items-center gap-1">
              <MapPin size={13} style={{ color: '#FF9900' }} />
              India
            </span>
          </div>

          {/* Search bar */}
          <div className="flex-1 flex items-stretch min-w-0 rounded-md overflow-hidden">
            <button
              type="button"
              className="hidden lg:flex items-center gap-1 border-r border-[#CDCDCD] px-3 text-sm text-[#555555] hover:bg-[#D4D4D4] transition-colors flex-shrink-0"
              style={{ backgroundColor: '#E6E6E6' }}
            >
              Encore
              <ChevronDown size={14} />
            </button>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search Encore deals, second-life products, verified returns"
              className="min-w-0 flex-1 border-0 px-4 py-2.5 text-sm text-[#0F1111] outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              style={{ backgroundColor: '#FF9900' }}
              className="px-4 hover:bg-[#F08804] transition-colors flex items-center"
              aria-label="Search"
            >
              <Search size={20} className="text-[#0F1111]" />
            </button>
          </div>

          {/* Account & Lists / Returns & Orders */}
          <div className="hidden xl:flex items-center gap-4 ml-1">
            <button type="button" className="text-left text-white leading-tight border border-transparent hover:border-white rounded px-1 py-0.5 transition-colors">
              <span className="block text-[11px] text-[#CCCCCC]">Hello, sign in</span>
              <span className="block text-sm font-bold flex items-center gap-0.5">
                Account &amp; Lists <ChevronDown size={12} />
              </span>
            </button>
            <button type="button" className="text-left text-white leading-tight border border-transparent hover:border-white rounded px-1 py-0.5 transition-colors">
              <span className="block text-[11px] text-[#CCCCCC]">Returns</span>
              <span className="block text-sm font-bold">&amp; Orders</span>
            </button>
          </div>

          {/* Sell CTA */}
          {onPrimaryAction && (
            <button
              type="button"
              onClick={onPrimaryAction}
              style={{ backgroundColor: '#FFD814', color: '#0F1111' }}
              className="hidden md:inline-flex items-center rounded-md px-4 py-2 text-sm font-bold hover:brightness-95 transition-all whitespace-nowrap"
            >
              {primaryLabel}
            </button>
          )}

          {/* Cart */}
          <button type="button" onClick={onOpenCart} className="hidden lg:flex items-end gap-1 text-white border border-transparent hover:border-white rounded px-1 py-0.5 transition-colors min-w-fit">
            <div className="relative">
              <ShoppingCart size={28} />
              <span
                className="absolute -top-1 left-3 text-[11px] font-bold leading-none"
                style={{ color: '#FF9900' }}
              >
                {cartCount}
              </span>
            </div>
            <span className="text-sm font-bold">Cart</span>
          </button>

        </div>
      </div>
    </nav>
  )
}
