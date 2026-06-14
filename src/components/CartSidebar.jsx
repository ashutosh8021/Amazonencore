import { useState } from 'react'
import { X, ShoppingCart, Trash2, Minus, Plus, Clock } from 'lucide-react'

function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
}

const DELIVERY_OPTS = [
  { id: 'standard', label: 'Standard', detail: `By ${addDays(3)}`, subtext: '2–3 business days', price: 0 },
  { id: 'express',  label: 'Express',  detail: `By ${addDays(1)}`, subtext: 'Tomorrow',           price: 49 },
]

export default function CartSidebar({ items, isOpen, onClose, onRemove, onUpdateQty }) {
  const [delivery, setDelivery] = useState('standard')

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const deliveryCost = delivery === 'express' ? 49 : 0
  const total = subtotal + deliveryCost
  const itemCount = items.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Slide-in panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0,
          width: 'min(420px, 100vw)',
          backgroundColor: 'white',
          zIndex: 1001,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ backgroundColor: '#131921', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingCart size={20} color="white" />
            <span style={{ fontWeight: 700, fontSize: 18, color: 'white' }}>
              Shopping cart{itemCount > 0 && (
                <span style={{ color: '#FF9900', marginLeft: 6 }}>({itemCount})</span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer', padding: 6, borderRadius: 4, display: 'flex', alignItems: 'center' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '72px 20px 40px', color: '#565959' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#F3F3F3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <ShoppingCart size={28} color="#AAAAAA" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#0F1111', marginBottom: 6 }}>Your cart is empty</p>
              <p style={{ fontSize: 14 }}>Add items from the marketplace to get started.</p>
            </div>
          ) : (
            <div style={{ paddingTop: 16 }}>
              {items.map((item) => {
                const fallback = `https://picsum.photos/seed/${item.id}/400/400`
                return (
                  <div
                    key={item.id}
                    style={{ display: 'flex', gap: 14, paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid #E7E7E7' }}
                  >
                    <img
                      src={item.image ?? fallback}
                      alt={item.title}
                      onError={(e) => { e.target.src = fallback }}
                      style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 6, border: '1px solid #D5D9D9', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#0F1111', lineHeight: 1.4, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.title}
                      </p>
                      <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#e6f4ea', color: '#067D62', borderRadius: 20, padding: '2px 8px', marginBottom: 10 }}>
                        {item.conditionGrade}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 17, fontWeight: 500, color: '#0F1111' }}>
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D5D9D9', borderRadius: 6, overflow: 'hidden' }}>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.id, -1)}
                              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8F8', border: 'none', cursor: 'pointer', color: '#0F1111' }}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ width: 28, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#0F1111', userSelect: 'none' }}>
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.id, 1)}
                              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8F8', border: 'none', cursor: 'pointer', color: '#0F1111' }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            aria-label="Remove item"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B12704', padding: 4, display: 'flex', alignItems: 'center' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      {item.qty > 1 && (
                        <p style={{ fontSize: 11, color: '#565959', marginTop: 4 }}>
                          ₹{item.price.toLocaleString('en-IN')} each
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid #D5D9D9', padding: '18px 20px', flexShrink: 0 }}>
            {/* Delivery options */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#0F1111', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Delivery option
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {DELIVERY_OPTS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDelivery(opt.id)}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 8, textAlign: 'left',
                    border: `2px solid ${delivery === opt.id ? '#FF9900' : '#D5D9D9'}`,
                    backgroundColor: delivery === opt.id ? '#fff8e0' : 'white',
                    cursor: 'pointer', transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    <Clock size={11} color={delivery === opt.id ? '#c45500' : '#565959'} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: delivery === opt.id ? '#c45500' : '#0F1111' }}>
                      {opt.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 10, color: '#565959', margin: '0 0 3px' }}>{opt.detail}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: opt.price > 0 ? '#c45500' : '#067D62', margin: 0 }}>
                    {opt.price > 0 ? `+₹${opt.price}` : 'Free'}
                  </p>
                </button>
              ))}
            </div>

            {/* Totals */}
            <div style={{ backgroundColor: '#F7F8F8', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#565959', marginBottom: 6 }}>
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#565959', marginBottom: 8 }}>
                <span>Delivery</span>
                <span style={{ color: deliveryCost > 0 ? '#0F1111' : '#067D62', fontWeight: 500 }}>
                  {deliveryCost > 0 ? `₹${deliveryCost}` : 'Free'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: '#0F1111', borderTop: '1px solid #D5D9D9', paddingTop: 10 }}>
                <span>Order total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              style={{ width: '100%', backgroundColor: '#FFD814', color: '#0F1111', fontWeight: 700, fontSize: 15, padding: '13px', borderRadius: 24, border: 'none', cursor: 'pointer' }}
            >
              Proceed to checkout
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: '#007185', fontSize: 14, cursor: 'pointer', fontWeight: 600, padding: '8px' }}
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
