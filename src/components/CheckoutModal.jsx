import { useState } from 'react'
import { X, CheckCircle, MapPin, CreditCard, Clock } from 'lucide-react'

function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })
}

const DELIVERY_OPTS = [
  { id: 'standard', label: 'Standard',  badge: '2–3 days',  detail: `Arrives by ${addDays(3)}`, price: 0  },
  { id: 'express',  label: 'Express',   badge: 'Tomorrow',  detail: `Arrives by ${addDays(1)}`, price: 49 },
]

export default function CheckoutModal({ product, onClose }) {
  const [delivery, setDelivery] = useState('standard')
  const [ordered, setOrdered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orderId] = useState(() => `EC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`)

  const deliveryCost = delivery === 'express' ? 49 : 0
  const total = product.price + deliveryCost
  const fallback = `https://picsum.photos/seed/${product.id}/400/400`

  function placeOrder() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOrdered(true)
    }, 1200)
  }

  return (
    <>
      {/* Backdrop + centering wrapper */}
      <div
        onClick={!ordered ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 1002,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
      {/* Modal — stop click bubbling so inner clicks don't close it */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ordered ? 'Order confirmed' : 'Buy now'}
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(520px, 100%)',
          maxHeight: '90vh', overflowY: 'auto',
          backgroundColor: 'white', borderRadius: 12,
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}
      >
        {ordered ? (
          /* ─── Success ─── */
          <div style={{ padding: '48px 40px', textAlign: 'center' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', backgroundColor: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={42} color="#067D62" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F1111', margin: '0 0 8px' }}>Order placed</h2>
            <p style={{ color: '#565959', fontSize: 14, margin: '0 0 4px' }}>Thank you for shopping with Amazon Encore.</p>
            <p style={{ color: '#879596', fontSize: 13, margin: 0 }}>
              Order ID: <span style={{ color: '#0F1111', fontWeight: 600 }}>{orderId}</span>
            </p>

            <div style={{ backgroundColor: '#F7F8F8', borderRadius: 10, padding: '18px 20px', margin: '24px 0', textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
                <img
                  src={product.image ?? fallback}
                  alt={product.title}
                  onError={(e) => { e.target.src = fallback }}
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #D5D9D9', flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1111', lineHeight: 1.4, marginBottom: 8 }}>{product.title}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#0F1111', margin: 0 }}>₹{total.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #E7E7E7', paddingTop: 14, display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <Clock size={15} color="#067D62" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 14, color: '#067D62', fontWeight: 600, margin: '0 0 2px' }}>
                    {delivery === 'express' ? 'Express delivery — tomorrow' : 'Standard delivery — 2–3 days'}
                  </p>
                  <p style={{ fontSize: 12, color: '#565959', margin: 0 }}>
                    {DELIVERY_OPTS.find(o => o.id === delivery)?.detail}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: '#FFD814', color: '#0F1111', fontWeight: 700, fontSize: 15, padding: '12px 36px', borderRadius: 24, border: 'none', cursor: 'pointer' }}
            >
              Continue shopping
            </button>
          </div>
        ) : (
          /* ─── Checkout form ─── */
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #E7E7E7' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F1111', margin: 0 }}>Buy now</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#565959', padding: 6, display: 'flex', alignItems: 'center', borderRadius: 6 }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              {/* Product */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, padding: '10px', backgroundColor: '#F7F8F8', borderRadius: 8, border: '1px solid #D5D9D9' }}>
                <img
                  src={product.image ?? fallback}
                  alt={product.title}
                  onError={(e) => { e.target.src = fallback }}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #D5D9D9', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#0F1111', lineHeight: 1.3, marginBottom: 4 }}>{product.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#e6f4ea', color: '#067D62', borderRadius: 20, padding: '1px 7px' }}>
                      {product.conditionGrade}
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#0F1111' }}>₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Delivery address */}
              <div style={{ marginBottom: 10, padding: '10px 12px', backgroundColor: '#F7F8F8', borderRadius: 8, border: '1px solid #D5D9D9', display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={14} color="#565959" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 12, color: '#0F1111', fontWeight: 600, margin: 0 }}>Ashutosh Kumar · Bengaluru, Karnataka — 560001</p>
                </div>
              </div>

              {/* Delivery speed */}
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#565959', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Delivery speed</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {DELIVERY_OPTS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDelivery(opt.id)}
                      style={{
                        flex: 1, padding: '8px 10px', borderRadius: 8, textAlign: 'left',
                        border: `2px solid ${delivery === opt.id ? '#FF9900' : '#D5D9D9'}`,
                        backgroundColor: delivery === opt.id ? '#fff8e0' : 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <p style={{ fontSize: 12, fontWeight: 700, color: delivery === opt.id ? '#c45500' : '#0F1111', margin: '0 0 1px' }}>{opt.label}</p>
                      <p style={{ fontSize: 10, color: '#565959', margin: '0 0 2px' }}>{opt.detail}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color: opt.price > 0 ? '#c45500' : '#067D62', margin: 0 }}>
                        {opt.price > 0 ? `+₹${opt.price}` : 'Free'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment + Order total combined */}
              <div style={{ backgroundColor: '#F7F8F8', borderRadius: 8, padding: '12px', marginBottom: 14, border: '1px solid #D5D9D9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #E7E7E7' }}>
                  <CreditCard size={13} color="#565959" />
                  <span style={{ fontSize: 12, color: '#0F1111', fontWeight: 600 }}>Cash on delivery</span>
                  <span style={{ fontSize: 11, color: '#565959', marginLeft: 4 }}>· Pay on arrival</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#565959', marginBottom: 4 }}>
                  <span>Item</span><span>₹{product.price.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#565959', marginBottom: 8 }}>
                  <span>Delivery</span>
                  <span style={{ color: deliveryCost > 0 ? '#0F1111' : '#067D62', fontWeight: 500 }}>
                    {deliveryCost > 0 ? `₹${deliveryCost}` : 'Free'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#0F1111', borderTop: '1px solid #D5D9D9', paddingTop: 8 }}>
                  <span>Order total</span><span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={placeOrder}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#FFE878' : '#FFD814',
                  color: '#0F1111', fontWeight: 700, fontSize: 15,
                  padding: '12px', borderRadius: 24, border: 'none',
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Placing order…' : `Place order · ₹${total.toLocaleString('en-IN')}`}
              </button>
              <p style={{ textAlign: 'center', fontSize: 10, color: '#879596', marginTop: 8, marginBottom: 0 }}>
                By placing your order you agree to Encore's conditions of use.
              </p>
            </div>
          </>
        )}
      </div>
      </div>
    </>
  )
}
