import { listings } from '../data/listings.js'

const CATEGORIES = [
  { key: 'Electronics',    label: 'Second-life electronics' },
  { key: 'Books',          label: 'Second-life books' },
  { key: 'Footwear',       label: 'Pre-loved footwear' },
  { key: 'Home & Kitchen', label: 'Home & kitchen' },
]

function picksFor(category) {
  return listings.filter(l => l.category === category && l.image).slice(0, 4)
}

export default function CategoryTiles({ onProductClick, onMarketplace }) {
  const cards = CATEGORIES
    .map(c => ({ ...c, picks: picksFor(c.key) }))
    .filter(c => c.picks.length === 4)

  if (!cards.length) return null

  return (
    <section className="px-4 pt-2 pb-2">
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div key={card.key} className="rounded-md bg-white p-5 flex flex-col" style={{ border: '1px solid #D5D9D9' }}>
            <h3 className="text-lg font-bold mb-3 leading-snug" style={{ color: '#0F1111' }}>
              {card.label}
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {card.picks.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onProductClick?.(p)}
                  className="rounded border overflow-hidden aspect-square hover:opacity-90 transition-opacity"
                  style={{ borderColor: '#F0F0F0' }}
                  title={p.title}
                >
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onMarketplace}
              className="text-sm font-semibold hover:underline mt-auto text-left"
              style={{ color: '#007185' }}
            >
              Shop all {card.key.toLowerCase()} ›
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
