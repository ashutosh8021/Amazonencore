import { useState } from 'react'
import { Lock, LogIn, Mail, User, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function AuthModal({ onClose }) {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  function switchTab(next) {
    setTab(next)
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      if (tab === 'signin') {
        await signIn(email, password)
        onClose()
      } else {
        await signUp(email, password, name)
        setSuccess('Account created. Check your email to confirm, then sign in.')
        switchTab('signin')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,17,17,0.72)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F3F3F3] transition-colors"
          aria-label="Close"
        >
          <X size={16} style={{ color: '#565959' }} />
        </button>

        {/* Wordmark */}
        <div className="text-center mb-6">
          <div style={{ display: 'inline-flex', alignItems: 'flex-start', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '22px', color: '#0F1111' }}>amazon</span>
            <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '11px', color: '#FF9900', marginLeft: '1px', marginTop: '7px' }}>.in</span>
          </div>
          <p className="text-xs text-[#565959] mt-1 font-semibold uppercase tracking-wider" style={{ color: '#FF9900' }}>encore</p>
        </div>

        {/* Tab switcher */}
        <div
          className="flex rounded-lg overflow-hidden border mb-5"
          style={{ borderColor: '#D5D9D9' }}
        >
          {[['signin', 'Sign in'], ['signup', 'Create account']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchTab(key)}
              className="flex-1 py-2.5 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: tab === key ? '#131921' : 'transparent',
                color: tab === key ? 'white' : '#565959',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-[#c40000] bg-[#fff5f5] p-3 text-sm text-[#c40000]">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md border border-[#067D62] bg-[#e6f4ea] p-3 text-sm text-[#067D62]">
            {success}
          </div>
        )}

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border rounded-lg py-2.5 mb-4 text-sm font-semibold hover:bg-[#F3F3F3] transition-colors"
          style={{ borderColor: '#D5D9D9', color: '#0F1111' }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t" style={{ borderColor: '#D5D9D9' }} />
          <span className="text-xs text-[#879596]">or</span>
          <div className="flex-1 border-t" style={{ borderColor: '#D5D9D9' }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-[#0F1111] mb-1.5">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#879596' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#FF9900] transition-colors"
                  style={{ borderColor: '#D5D9D9', color: '#0F1111' }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#0F1111] mb-1.5">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#879596' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#FF9900] transition-colors"
                style={{ borderColor: '#D5D9D9', color: '#0F1111' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0F1111] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#879596' }} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'}
                className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#FF9900] transition-colors"
                style={{ borderColor: '#D5D9D9', color: '#0F1111' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: '#FFD814', color: '#0F1111', opacity: loading ? 0.7 : 1 }}
          >
            <LogIn size={15} />
            {loading ? 'Please wait…' : tab === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-center text-[#879596] mt-5">
          By continuing you agree to Amazon's conditions of use and privacy notice.
        </p>
      </div>
    </div>
  )
}
