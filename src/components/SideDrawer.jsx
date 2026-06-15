import { ChevronRight, X, User, TrendingUp, ShoppingBag, BookOpen, Zap, Shirt, Home, Package, Recycle, Heart, Play, HelpCircle } from 'lucide-react'

const ENCORE_PROGRAMS = [
  { label: 'Sell with Encore',     Icon: ShoppingBag, action: 'sell' },
  { label: 'Encore marketplace',   Icon: ShoppingBag, action: 'marketplace' },
  { label: 'See AI decide (demo)', Icon: Play,        action: 'demo' },
  { label: 'Encore stories',       Icon: Heart,       action: 'personas' },
]

const CATEGORIES = [
  { label: 'Books & media',        Icon: BookOpen },
  { label: 'Electronics',          Icon: Zap },
  { label: 'Footwear',             Icon: Package },
  { label: 'Apparel & fashion',    Icon: Shirt },
  { label: 'Home & kitchen',       Icon: Home },
  { label: 'Sports & outdoors',    Icon: Package },
  { label: 'Toys & games',         Icon: Package },
]

const HELP_LINKS = [
  { label: 'How Encore works',    action: 'how-it-works' },
  { label: 'About Encore',        action: 'trust' },
  { label: 'Green credits',       action: null },
  { label: 'AI condition grading', action: 'ai-decide' },
]

export default function SideDrawer({ open, onClose, onGetStarted, onDemoMode, onPersonas, onMarketplace, onScrollTo }) {
  if (!open) return null

  function handle(action) {
    onClose()
    if (action === 'sell')           { onGetStarted?.() }
    else if (action === 'demo')      { onDemoMode?.() }
    else if (action === 'personas')  { onPersonas?.() }
    else if (action === 'marketplace') { onMarketplace?.() }
    else if (action)                 { onScrollTo?.(action) }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ backgroundColor: 'rgba(15,17,17,0.65)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 left-0 z-[101] h-full overflow-y-auto flex flex-col"
        style={{ width: 340, backgroundColor: '#fff', boxShadow: '4px 0 24px rgba(0,0,0,0.35)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ backgroundColor: '#131921' }}
        >
          <div className="flex items-center gap-2">
            <User size={20} style={{ color: '#fff' }} />
            <span className="text-base font-bold text-white">Hello, sign in</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} style={{ color: '#fff' }} />
          </button>
        </div>

        {/* Encore Programs */}
        <div className="border-b" style={{ borderColor: '#D5D9D9' }}>
          <div className="px-4 pt-4 pb-2">
            <p className="text-base font-bold mb-1" style={{ color: '#0F1111' }}>Encore programs</p>
          </div>
          {ENCORE_PROGRAMS.map(({ label, Icon, action }) => (
            <button
              key={label}
              type="button"
              onClick={() => handle(action)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F7F8F8] transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#131921' }}>
                <Icon size={15} style={{ color: '#FF9900' }} />
              </div>
              <span className="text-sm" style={{ color: '#0F1111' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Trending */}
        <div className="border-b" style={{ borderColor: '#D5D9D9' }}>
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <TrendingUp size={15} style={{ color: '#FF9900' }} />
            <p className="text-base font-bold" style={{ color: '#0F1111' }}>Trending</p>
          </div>
          {['Popular second-life picks', 'New Encore listings', 'Books making a comeback'].map(item => (
            <button
              key={item}
              type="button"
              onClick={() => handle('marketplace')}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#F7F8F8] transition-colors"
            >
              <span className="text-sm" style={{ color: '#0F1111' }}>{item}</span>
            </button>
          ))}
        </div>

        {/* Shop by Category */}
        <div className="border-b" style={{ borderColor: '#D5D9D9' }}>
          <div className="px-4 pt-4 pb-2">
            <p className="text-base font-bold" style={{ color: '#0F1111' }}>Shop by category</p>
          </div>
          {CATEGORIES.map(({ label, Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => handle('marketplace')}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#F7F8F8] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon size={16} style={{ color: '#565959' }} />
                <span className="text-sm" style={{ color: '#0F1111' }}>{label}</span>
              </div>
              <ChevronRight size={16} style={{ color: '#879596' }} />
            </button>
          ))}
        </div>

        {/* Help & Settings */}
        <div className="border-b" style={{ borderColor: '#D5D9D9' }}>
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <HelpCircle size={15} style={{ color: '#565959' }} />
            <p className="text-base font-bold" style={{ color: '#0F1111' }}>Help &amp; settings</p>
          </div>
          {HELP_LINKS.map(({ label, action }) => (
            <button
              key={label}
              type="button"
              onClick={() => handle(action)}
              className="w-full flex items-center px-4 py-2.5 text-left hover:bg-[#F7F8F8] transition-colors"
            >
              <span className="text-sm" style={{ color: '#0F1111' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Encore badge at bottom */}
        <div className="px-4 py-5 mt-auto">
          <div className="flex items-center gap-2 mb-1">
            <Recycle size={14} style={{ color: '#FF9900' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FF9900' }}>
              Amazon Encore
            </span>
          </div>
          <p className="text-xs" style={{ color: '#879596' }}>
            AI-powered second-life commerce. Every product deserves another chance.
          </p>
        </div>
      </div>
    </>
  )
}
