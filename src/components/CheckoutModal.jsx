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
      {/* Backdrop — only close on click if order not yet placed */}
      <div
        onClick={!ordered ? onClose : undefined}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1002 }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ordered ? 'Order confirmed' : 'Buy now'}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(520px, calc(100vw - 32px))',
          maxHeight: '90vh', overflowY: 'auto',
          backgroundColor: 'white', borderRadius: 12,
          zIndex: 1003,
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

            <div style={{ padding: '24px' }}>
              {/* Product */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
                <img
                  src={product.image ?? fallback}
                  alt={product.title}
                  onError={(e) => { e.target.src = fallback }}
                  style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #D5D9D9', flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#0F1111', lineHeight: 1.4, marginBottom: 8 }}>{product.title}</p>
                  <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#e6f4ea', color: '#067D62', borderRadius: 20, padding: '2px 8px', marginBottom: 10 }}>
                    {product.conditionGrade}
                  </span>
                  <p style={{ fontSize: 22, fontWeight: 500, color: '#0F1111', margin: 0 }}>₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Delivery address */}
              <div style={{ marginBottom: 16, padding: '14px 16px', backgroundColor: '#F7F8F8', borderRadius: 8, border: '1px solid #D5D9D9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <MapPin size={14} color="#565959" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0F1111', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Delivering to</span>
                </div>
                <p style={{ fontSize: 14, color: '#0F1111', fontWeight: 600, margin: '0 0 2px' }}>Ashutosh Kumar</p>
                <p style={{ fontSize: 13, color: '#565959', margin: 0 }}>Bengaluru, Karnataka — 560001</p>
              </div>

              {/* Delivery speed */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#0F1111', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Delivery speed</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {DELIVERY_OPTS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDelivery(opt.id)}
                      style={{
                        flex: 1, padding: '12px 14px', borderRadius: 8, textAlign: 'left',
                        border: `2px solid ${delivery === opt.id ? '#FF9900' : '#D5D9D9'}`,
                        backgroundColor: delivery === opt.id ? '#fff8e0' : 'white',
                        cursor: 'pointer', transition: 'border-color 0.15s ease',
                      }}
                    >
                      <p style={{ fontSize: 13, fontWeight: 700, color: delivery === opt.id ? '#c45500' : '#0F1111', margin: '0 0 2px' }}>{opt.label}</p>
                      <p style={{ fontSize: 11, color: '#565959', margin: '0 0 4px' }}>{opt.detail}</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: opt.price > 0 ? '#c45500' : '#067D62', margin: 0 }}>
                        {opt.price > 0 ? `+₹${opt.price}` : 'Free'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div style={{ marginBottom: 20, padding: '14px 16px', backgroundColor: '#F7F8F8', borderRadius: 8, border: '1px solid #D5D9D9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <CreditCard size={14} color="#565959" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0F1111', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment method</span>
                </div>
                <p style={{ fontSize: 14, color: '#0F1111', fontWeight: 600, margin: '0 0 2px' }}>Cash on delivery</p>
                <p style={{ fontSize: 13, color: '#565959', margin: 0 }}>Pay when your order arrives</p>
              </div>

              {/* Order total */}
              <div style={{ backgroundColor: '#F7F8F8', borderRadius: 8, padding: '16px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#565959', marginBottom: 6 }}>
                  <span>Item</span>
                  <span>₹{product.price.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#565959', marginBottom: 10 }}>
                  <span>Delivery</span>
                  <span style={{ color: deliveryCost > 0 ? '#0F1111' : '#067D62', fontWeight: deliveryCost > 0 ? 400 : 500 }}>
                    {deliveryCost > 0 ? `₹${deliveryCost}` : 'Free'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#0F1111', borderTop: '1px solid #D5D9D9', paddingTop: 10 }}>
                  <span>Order total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={placeOrder}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#FFE878' : '#FFD814',
                  color: '#0F1111', fontWeight: 700, fontSize: 16,
                  padding: '14px', borderRadius: 24, border: 'none',
                  cursor: loading ? 'wait' : 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {loading ? 'Placing order…' : `Place order  ·  ₹${total.toLocaleString('en-IN')}`}
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#879596', marginTop: 10, marginBottom: 0 }}>
                By placing your order you agree to Encore's conditions of use.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
