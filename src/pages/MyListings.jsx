import { useEffect, useState } from 'react'
import { ArrowLeft, Package, Plus, Tag, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import TopNav from '../components/TopNav.jsx'
import SubNav from '../components/SubNav.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchUserListings } from '../lib/api.js'

const GRADE_COLORS = {
  'Like New':   { bg: '#e6f4ea', color: '#067D62' },
  'Very Good':  { bg: '#e6f4ea', color: '#067D62' },
  'Good':       { bg: '#fff3e0', color: '#c45500' },
  'Fair':       { bg: '#fce4ec', color: '#b71c1c' },
}

function gradeStyle(grade) {
  return GRADE_COLORS[grade] ?? { bg: '#f0f0f0', color: '#565959' }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MyListings({ onBack, nav = {}, onSell }) {
  const { user } = useAuth() ?? {}
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        setLoading(true)
        const { listings } = await fetchUserListings()
        const mine = (listings || []).filter(l => l.user_id === user.id)
        setItems(mine)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh' }}>
      <TopNav
        onPrimaryAction={nav.onGetStarted}
        primaryLabel="Sell with Encore"
        onHome={onBack}
        onSearch={nav.onSearch}
        cartCount={nav.cartCount}
        onOpenCart={nav.onOpenCart}
        onSignIn={nav.onSignIn}
        onMyListings={nav.onMyListings}
        onProfile={nav.onProfile}
      />
      <SubNav
        onGetStarted={nav.onGetStarted}
        onDemoMode={nav.onDemoMode}
        onPersonas={nav.onPersonas}
        onMarketplace={nav.onMarketplace}
        onCampus={nav.onCampus}
        onScrollTo={nav.onScrollTo}
        onSignIn={nav.onSignIn}
      />

      <div className="max-w-[1000px] mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="text-sm mb-4" style={{ color: '#565959' }}>
          <button type="button" onClick={onBack} className="hover:underline" style={{ color: '#007185' }}>
            Amazon Encore
          </button>
          {' › '}
          <span>My listings</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm mb-2 hover:text-[#C7511F] transition-colors"
              style={{ color: '#007185' }}
            >
              <ArrowLeft size={15} />
              Back to Encore home
            </button>
            <h1 className="text-2xl font-bold" style={{ color: '#0F1111' }}>My Encore listings</h1>
            {!loading && (
              <p className="text-sm mt-1" style={{ color: '#565959' }}>
                {items.length} {items.length === 1 ? 'listing' : 'listings'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onSell ?? nav.onGetStarted}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded font-semibold text-sm hover:brightness-95 transition-all"
            style={{ backgroundColor: '#FFD814', color: '#0F1111' }}
          >
            <Plus size={16} />
            List another item
          </button>
        </div>

        {/* States */}
        {!user && (
          <div className="bg-white rounded-md border p-8 text-center" style={{ borderColor: '#D5D9D9' }}>
            <Package size={40} className="mx-auto mb-3" style={{ color: '#D5D9D9' }} />
            <p className="font-semibold mb-1" style={{ color: '#0F1111' }}>Sign in to see your listings</p>
            <p className="text-sm" style={{ color: '#565959' }}>Your listed items will appear here.</p>
          </div>
        )}

        {user && loading && (
          <div className="bg-white rounded-md border p-8 text-center" style={{ borderColor: '#D5D9D9' }}>
            <div className="w-8 h-8 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm" style={{ color: '#565959' }}>Loading your listings…</p>
          </div>
        )}

        {user && !loading && error && (
          <div className="bg-white rounded-md border p-8 text-center" style={{ borderColor: '#D5D9D9' }}>
            <AlertCircle size={36} className="mx-auto mb-3" style={{ color: '#C40000' }} />
            <p className="font-semibold mb-1" style={{ color: '#0F1111' }}>Could not load listings</p>
            <p className="text-sm" style={{ color: '#565959' }}>{error}</p>
          </div>
        )}

        {user && !loading && !error && items.length === 0 && (
          <div className="bg-white rounded-md border p-12 text-center" style={{ borderColor: '#D5D9D9' }}>
            <Package size={48} className="mx-auto mb-4" style={{ color: '#D5D9D9' }} />
            <h2 className="text-lg font-bold mb-2" style={{ color: '#0F1111' }}>No listings yet</h2>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#565959' }}>
              Items you list through Encore will appear here. Upload a photo and our AI will grade the
              condition and show you the value math instantly.
            </p>
            <button
              type="button"
              onClick={onSell ?? nav.onGetStarted}
              className="inline-flex items-center gap-2 px-6 py-3 rounded font-semibold hover:brightness-95 transition-all"
              style={{ backgroundColor: '#FFD814', color: '#0F1111' }}
            >
              <Plus size={16} />
              List your first item
            </button>
          </div>
        )}

        {/* Listing cards */}
        {user && !loading && items.length > 0 && (
          <div className="flex flex-col gap-4">
            {items.map((item) => {
              const gs = gradeStyle(item.condition_grade || item.conditionGrade)
              const price = Number(item.price) || 0
              const origPrice = Number(item.original_price) || 0
              const title = item.title || 'Untitled listing'
              const grade = item.condition_grade || item.conditionGrade || '—'
              const category = item.category || 'General'
              const createdAt = item.created_at
              const decision = item.decision || 'resell'

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-md border"
                  style={{ borderColor: '#D5D9D9' }}
                >
                  {/* Card header */}
                  <div
                    className="flex items-center justify-between px-5 py-3 border-b rounded-t-md"
                    style={{ backgroundColor: '#F0F2F2', borderColor: '#D5D9D9' }}
                  >
                    <div className="flex items-center gap-6 text-xs" style={{ color: '#565959' }}>
                      <div>
                        <span className="font-semibold uppercase tracking-wide">Listed on</span>
                        <p className="mt-0.5 font-semibold" style={{ color: '#0F1111' }}>{formatDate(createdAt)}</p>
                      </div>
                      <div>
                        <span className="font-semibold uppercase tracking-wide">Listed price</span>
                        <p className="mt-0.5 font-semibold" style={{ color: '#0F1111' }}>
                          ₹{price.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold uppercase tracking-wide">Category</span>
                        <p className="mt-0.5 font-semibold" style={{ color: '#0F1111' }}>{category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: '#e6f4ea', color: '#067D62' }}
                      >
                        <CheckCircle size={11} />
                        Active
                      </span>
                      <span className="text-xs" style={{ color: '#565959' }}>
                        Encore listing #{String(item.id).slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="flex gap-4 p-5">
                    {/* Thumbnail */}
                    <div
                      className="w-20 h-20 rounded flex-shrink-0 flex items-center justify-center border overflow-hidden"
                      style={{ borderColor: '#D5D9D9', backgroundColor: '#F3F3F3' }}
                    >
                      {item.image_url ? (
                        <img src={item.image_url} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={28} style={{ color: '#C0C6C6' }} />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base leading-snug mb-1" style={{ color: '#0F1111' }}>
                        {title}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: gs.bg, color: gs.color }}
                        >
                          {grade}
                        </span>

                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: decision === 'donate' ? '#fff3e0' : decision === 'recycle' ? '#e3f2fd' : '#e6f4ea',
                            color: decision === 'donate' ? '#c45500' : decision === 'recycle' ? '#1565c0' : '#067D62',
                          }}
                        >
                          <Tag size={10} />
                          Encore {decision === 'donate' ? 'Donate' : decision === 'recycle' ? 'Recycle' : 'Resell'}
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: '#565959' }}>
                          <CheckCircle size={11} style={{ color: '#067D62' }} />
                          AI-verified condition
                        </span>
                      </div>

                      {origPrice > 0 && (
                        <p className="text-xs" style={{ color: '#565959' }}>
                          Original price:{' '}
                          <span className="line-through">₹{origPrice.toLocaleString('en-IN')}</span>
                          {price > 0 && (
                            <span className="ml-2 font-semibold" style={{ color: '#C40000' }}>
                              {Math.round((1 - price / origPrice) * 100)}% off
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Right col */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xl font-bold mb-1" style={{ color: '#0F1111' }}>
                        ₹{price.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs mb-3" style={{ color: '#565959' }}>Listed price</p>
                      <button
                        type="button"
                        onClick={nav.onMarketplace}
                        className="text-xs px-3 py-1.5 rounded border font-semibold transition-colors hover:bg-[#F0F2F2]"
                        style={{ borderColor: '#D5D9D9', color: '#0F1111' }}
                      >
                        View in marketplace
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
