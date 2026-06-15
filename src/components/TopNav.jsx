import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, MapPin, Menu, Package, Search, ShoppingCart, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function TopNav({ onPrimaryAction, primaryLabel = 'Sell with Encore', onHome, onSearch, cartCount = 0, onOpenCart, onSignIn, onMyListings, onProfile }) {
  const { user, signOut } = useAuth() ?? {}
  const [query, setQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? null

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  function handleSearch() {
    if (query.trim() && onSearch) onSearch(query.trim())
  }

  function handleAccountClick() {
    if (user) {
      setDropdownOpen(prev => !prev)
    } else if (onSignIn) {
      onSignIn()
    }
  }

  async function handleSignOut() {
    setDropdownOpen(false)
    if (signOut) await signOut()
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

          {/* Amazon.in logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); if (onHome) onHome() }}
            className="flex-shrink-0 select-none border border-transparent hover:border-white rounded px-1 py-0.5 transition-colors inline-block"
            aria-label="Amazon Encore home"
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', lineHeight: 1 }}>
              <span style={{ color: 'white', fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '22px', letterSpacing: '-0.5px', lineHeight: 1 }}>amazon</span>
              <span style={{ color: '#FF9900', fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '11px', lineHeight: 1, marginLeft: '1px', marginTop: '7px' }}>.in</span>
            </div>
            <svg viewBox="0 0 82 15" width="82" height="11" style={{ display: 'block', marginTop: '2px' }} aria-hidden="true">
              <path d="M 4 4 Q 34 14 63 4" stroke="#FF9900" strokeWidth="4" fill="none" strokeLinecap="round"/>
              <path d="M 57 0 L 68 4 L 59 10 Z" fill="#FF9900"/>
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

          {/* Account & Lists — auth-aware */}
          <div className="hidden xl:flex items-center gap-4 ml-1">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={handleAccountClick}
                className="text-left text-white leading-tight border border-transparent hover:border-white rounded px-1 py-0.5 transition-colors"
              >
                <span className="block text-[11px] text-[#CCCCCC]">
                  {user ? `Hello, ${firstName}` : 'Hello, sign in'}
                </span>
                <span className="block text-sm font-bold flex items-center gap-0.5">
                  Account &amp; Lists <ChevronDown size={12} />
                </span>
              </button>

              {/* Dropdown (logged-in only) */}
              {dropdownOpen && user && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-lg shadow-lg border overflow-hidden z-50"
                  style={{ backgroundColor: 'white', borderColor: '#D5D9D9' }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: '#D5D9D9', backgroundColor: '#F7F8F8' }}>
                    <p className="text-xs text-[#565959]">Signed in as</p>
                    <p className="text-sm font-semibold text-[#0F1111] truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); onProfile?.() }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F1111] hover:bg-[#F3F3F3] transition-colors"
                  >
                    <User size={14} style={{ color: '#565959' }} />
                    Your profile
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); onMyListings?.() }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F1111] hover:bg-[#F3F3F3] transition-colors"
                  >
                    <Package size={14} style={{ color: '#565959' }} />
                    My listings
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F3F3F3] transition-colors border-t"
                    style={{ color: '#c40000', borderColor: '#D5D9D9' }}
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            <button type="button" onClick={onMyListings} className="text-left text-white leading-tight border border-transparent hover:border-white rounded px-1 py-0.5 transition-colors">
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
          <button
            type="button"
            onClick={onOpenCart}
            className="hidden lg:flex items-end gap-1 text-white border border-transparent hover:border-white rounded px-1 py-0.5 transition-colors min-w-fit"
          >
            <div className="relative">
              <ShoppingCart size={28} />
              <span className="absolute -top-1 left-3 text-[11px] font-bold leading-none" style={{ color: '#FF9900' }}>
                {cartCount}
              </span>
            </div>
            <span className="text-sm font-bold">Cart</span>
          </button>

          {/* Mobile sign-in icon (shown when not logged in on small screens) */}
          {!user && (
            <button
              type="button"
              onClick={() => onSignIn?.()}
              className="xl:hidden p-1.5 text-white border border-transparent hover:border-white rounded transition-colors"
              aria-label="Sign in"
            >
              <User size={20} />
            </button>
          )}

        </div>
      </div>
    </nav>
  )
}
