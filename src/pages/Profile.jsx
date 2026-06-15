import { useState, useEffect } from 'react'
import { ArrowLeft, User, Mail, Phone, MapPin, Leaf, Package, Edit3, CheckCircle2, Loader2 } from 'lucide-react'
import TopNav from '../components/TopNav.jsx'
import SubNav from '../components/SubNav.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchUserListings } from '../lib/api.js'

export default function Profile({ onBack, nav = {} }) {
  const { user, updateProfile } = useAuth() ?? {}
  const meta = user?.user_metadata ?? {}

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [greenCredits, setGreenCredits] = useState(0)
  const [listingCount, setListingCount] = useState(0)

  const [form, setForm] = useState({
    full_name: meta.full_name || '',
    phone: meta.phone || '',
    address_line1: meta.address_line1 || '',
    address_line2: meta.address_line2 || '',
    city: meta.city || '',
    state: meta.state || '',
    pincode: meta.pincode || '',
  })

  useEffect(() => {
    if (!user) return
    async function loadStats() {
      try {
        const { listings } = await fetchUserListings()
        const mine = (listings || []).filter(l => l.user_id === user.id)
        setListingCount(mine.length)
        const credits = mine.reduce((sum, l) => {
          if (l.decision === 'donate') return sum + 50
          if (l.decision === 'recycle') return sum + 100
          return sum + 10
        }, 0)
        setGreenCredits(credits || mine.length * 10)
      } catch { /* silent */ }
    }
    loadStats()
  }, [user])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      await updateProfile(form)
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const initials = (form.full_name || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—'

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
        onScrollTo={nav.onScrollTo}
        onSignIn={nav.onSignIn}
      />

      <div className="max-w-[900px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm mb-4" style={{ color: '#565959' }}>
          <button type="button" onClick={onBack} className="hover:underline" style={{ color: '#007185' }}>Amazon Encore</button>
          {' › '}Your account
        </div>

        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm mb-5 hover:text-[#C7511F] transition-colors"
          style={{ color: '#007185' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid md:grid-cols-[280px_1fr] gap-5">

          {/* Left — avatar + stats */}
          <div className="space-y-4">

            {/* Avatar card */}
            <div className="rounded-lg border bg-white p-6 text-center" style={{ borderColor: '#D5D9D9' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-white"
                style={{ backgroundColor: '#FF9900' }}>
                {initials}
              </div>
              <p className="font-bold text-lg" style={{ color: '#0F1111' }}>
                {form.full_name || user?.email?.split('@')[0] || 'Your name'}
              </p>
              <p className="text-sm mt-0.5" style={{ color: '#565959' }}>{user?.email}</p>
              <p className="text-xs mt-2" style={{ color: '#879596' }}>Member since {memberSince}</p>
            </div>

            {/* Green credits */}
            <div className="rounded-lg border p-5" style={{ borderColor: '#D5D9D9', backgroundColor: '#f0faf5' }}>
              <div className="flex items-center gap-2 mb-3">
                <Leaf size={18} style={{ color: '#067D62' }} />
                <span className="font-bold text-sm" style={{ color: '#067D62' }}>Green credits</span>
              </div>
              <p className="text-4xl font-bold mb-1" style={{ color: '#0F1111' }}>
                {greenCredits}
              </p>
              <p className="text-xs" style={{ color: '#565959' }}>
                Earned from {listingCount} listed item{listingCount !== 1 ? 's' : ''}.
                Credits are awarded for every item given a second life.
              </p>
              <div className="mt-3 pt-3 border-t space-y-1.5" style={{ borderColor: '#C3E6CB' }}>
                <div className="flex justify-between text-xs" style={{ color: '#565959' }}>
                  <span>Resell listing</span><span className="font-semibold">+10 credits</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: '#565959' }}>
                  <span>Donate</span><span className="font-semibold">+50 credits</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: '#565959' }}>
                  <span>Recycle</span><span className="font-semibold">+100 credits</span>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-lg border bg-white p-4" style={{ borderColor: '#D5D9D9' }}>
              <div className="flex items-center gap-2.5">
                <Package size={16} style={{ color: '#FF9900' }} />
                <div>
                  <p className="text-xl font-bold" style={{ color: '#0F1111' }}>{listingCount}</p>
                  <p className="text-xs" style={{ color: '#565959' }}>Items listed on Encore</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — profile form */}
          <div className="space-y-4">

            {/* Personal info */}
            <div className="rounded-lg border bg-white" style={{ borderColor: '#D5D9D9' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#D5D9D9', backgroundColor: '#F7F8F8' }}>
                <div className="flex items-center gap-2">
                  <User size={15} style={{ color: '#565959' }} />
                  <span className="font-bold text-sm" style={{ color: '#0F1111' }}>Personal information</span>
                </div>
                {!editing && (
                  <button type="button" onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                    style={{ color: '#007185' }}>
                    <Edit3 size={12} /> Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                {saved && (
                  <div className="flex items-center gap-2 p-3 rounded-md border text-sm font-semibold"
                    style={{ backgroundColor: '#e6f4ea', borderColor: '#067D62', color: '#067D62' }}>
                    <CheckCircle2 size={15} /> Profile saved successfully
                  </div>
                )}
                {error && (
                  <div className="p-3 rounded-md border text-sm"
                    style={{ backgroundColor: '#fff5f5', borderColor: '#c40000', color: '#c40000' }}>
                    {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#565959' }}>Full name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#879596' }} />
                      <input name="full_name" value={form.full_name} onChange={handleChange}
                        disabled={!editing} placeholder="Your name"
                        className="w-full border rounded-lg pl-8 pr-3 py-2.5 text-sm outline-none focus:border-[#FF9900] transition-colors disabled:bg-[#F7F8F8]"
                        style={{ borderColor: '#D5D9D9', color: '#0F1111' }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#565959' }}>Phone</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#879596' }} />
                      <input name="phone" value={form.phone} onChange={handleChange}
                        disabled={!editing} placeholder="+91 98765 43210"
                        className="w-full border rounded-lg pl-8 pr-3 py-2.5 text-sm outline-none focus:border-[#FF9900] transition-colors disabled:bg-[#F7F8F8]"
                        style={{ borderColor: '#D5D9D9', color: '#0F1111' }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#565959' }}>Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#879596' }} />
                    <input value={user?.email || ''} disabled
                      className="w-full border rounded-lg pl-8 pr-3 py-2.5 text-sm bg-[#F7F8F8]"
                      style={{ borderColor: '#D5D9D9', color: '#565959' }} />
                  </div>
                </div>

                {/* Delivery address */}
                <div className="pt-4 border-t" style={{ borderColor: '#E3E6E6' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={14} style={{ color: '#565959' }} />
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#565959' }}>Default delivery address</span>
                  </div>

                  <div className="space-y-3">
                    <input name="address_line1" value={form.address_line1} onChange={handleChange}
                      disabled={!editing} placeholder="Address line 1"
                      className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#FF9900] transition-colors disabled:bg-[#F7F8F8]"
                      style={{ borderColor: '#D5D9D9', color: '#0F1111' }} />
                    <input name="address_line2" value={form.address_line2} onChange={handleChange}
                      disabled={!editing} placeholder="Address line 2 (optional)"
                      className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#FF9900] transition-colors disabled:bg-[#F7F8F8]"
                      style={{ borderColor: '#D5D9D9', color: '#0F1111' }} />
                    <div className="grid grid-cols-3 gap-3">
                      <input name="city" value={form.city} onChange={handleChange}
                        disabled={!editing} placeholder="City"
                        className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#FF9900] transition-colors disabled:bg-[#F7F8F8]"
                        style={{ borderColor: '#D5D9D9', color: '#0F1111' }} />
                      <input name="state" value={form.state} onChange={handleChange}
                        disabled={!editing} placeholder="State"
                        className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#FF9900] transition-colors disabled:bg-[#F7F8F8]"
                        style={{ borderColor: '#D5D9D9', color: '#0F1111' }} />
                      <input name="pincode" value={form.pincode} onChange={handleChange}
                        disabled={!editing} placeholder="Pincode"
                        className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#FF9900] transition-colors disabled:bg-[#F7F8F8]"
                        style={{ borderColor: '#D5D9D9', color: '#0F1111' }} />
                    </div>
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-60"
                      style={{ backgroundColor: '#FFD814', color: '#0F1111' }}>
                      {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save changes'}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setError(null) }}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors hover:bg-[#F3F3F3]"
                      style={{ borderColor: '#D5D9D9', color: '#565959' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
