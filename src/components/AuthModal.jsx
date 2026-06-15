import { useState, useEffect } from 'react'
import { Lock, LogIn, Mail, User, X, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react'
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
  const {
    signIn, signUp, signInWithGoogle,
    resetPassword, updatePassword,
    passwordRecovery, clearPasswordRecovery,
  } = useAuth()

  const [view, setView] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [signupEmail, setSignupEmail] = useState('')

  useEffect(() => {
    if (passwordRecovery) setView('reset')
  }, [passwordRecovery])

  function switchView(next) {
    setView(next)
    setError(null)
    setSuccess(null)
  }

  async function handleSignIn(e) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await signIn(email, password)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await signUp(email, password, name)
      setSignupEmail(email)
      switchView('verify')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot(e) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await resetPassword(email)
      setSuccess('sent')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    setError(null); setLoading(true)
    try {
      await updatePassword(newPassword)
      clearPasswordRecovery()
      onClose()
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

  const isReset = view === 'reset'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,17,17,0.72)' }}
      onClick={isReset ? undefined : onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        {!isReset && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F3F3F3] transition-colors"
            aria-label="Close"
          >
            <X size={16} style={{ color: '#565959' }} />
          </button>
        )}

        {/* Wordmark */}
        <div className="text-center mb-6">
          <div style={{ display: 'inline-flex', alignItems: 'flex-start', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '22px', color: '#0F1111' }}>amazon</span>
            <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '11px', color: '#FF9900', marginLeft: '1px', marginTop: '7px' }}>.in</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: '#FF9900' }}>encore</p>
        </div>

        {/* ── VIEW: verify ── */}
        {view === 'verify' && (
          <div className="text-center py-2">
            <CheckCircle2 size={52} className="mx-auto mb-4" style={{ color: '#067D62' }} />
            <h2 className="text-lg font-bold text-[#0F1111] mb-2">Check your inbox</h2>
            <p className="text-sm text-[#565959] mb-1">We sent a verification link to</p>
            <p className="text-sm font-semibold text-[#0F1111] mb-4">{signupEmail}</p>
            <p className="text-sm text-[#565959] mb-6">
              Click the link in the email to activate your account, then come back and sign in.
            </p>
            <button
              type="button"
              onClick={() => switchView('signin')}
              className="text-sm font-semibold hover:underline"
              style={{ color: '#007185' }}
            >
              Back to sign in
            </button>
          </div>
        )}

        {/* ── VIEW: forgot password ── */}
        {view === 'forgot' && (
          <>
            <button
              type="button"
              onClick={() => switchView('signin')}
              className="flex items-center gap-1.5 text-sm mb-5 hover:underline"
              style={{ color: '#007185' }}
            >
              <ArrowLeft size={14} /> Back to sign in
            </button>
            <h2 className="text-base font-bold text-[#0F1111] mb-1">Reset your password</h2>
            <p className="text-sm text-[#565959] mb-5">Enter your email and we'll send you a reset link.</p>

            {error && (
              <div className="mb-4 rounded-md border border-[#c40000] bg-[#fff5f5] p-3 text-sm text-[#c40000]">{error}</div>
            )}

            {success === 'sent' ? (
              <div className="rounded-md border border-[#067D62] bg-[#e6f4ea] p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#067D62' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#067D62' }}>Reset link sent</p>
                  <p className="text-xs mt-0.5 text-[#565959]">Check your inbox and click the link to set a new password.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor: '#FFD814', color: '#0F1111', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            )}
          </>
        )}

        {/* ── VIEW: reset — set new password ── */}
        {view === 'reset' && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <KeyRound size={20} style={{ color: '#FF9900' }} />
              <h2 className="text-base font-bold text-[#0F1111]">Set a new password</h2>
            </div>
            <p className="text-sm text-[#565959] mb-5">Choose a new password for your account.</p>

            {error && (
              <div className="mb-4 rounded-md border border-[#c40000] bg-[#fff5f5] p-3 text-sm text-[#c40000]">{error}</div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0F1111] mb-1.5">New password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#879596' }} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#FF9900] transition-colors"
                    style={{ borderColor: '#D5D9D9', color: '#0F1111' }}
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                style={{ backgroundColor: '#FFD814', color: '#0F1111', opacity: loading ? 0.7 : 1 }}
              >
                <KeyRound size={15} />
                {loading ? 'Saving...' : 'Update password'}
              </button>
            </form>
          </>
        )}

        {/* ── VIEW: signin / signup ── */}
        {(view === 'signin' || view === 'signup') && (
          <>
            <div className="flex rounded-lg overflow-hidden border mb-5" style={{ borderColor: '#D5D9D9' }}>
              {[['signin', 'Sign in'], ['signup', 'Create account']].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchView(key)}
                  className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: view === key ? '#131921' : 'transparent',
                    color: view === key ? 'white' : '#565959',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-[#c40000] bg-[#fff5f5] p-3 text-sm text-[#c40000]">{error}</div>
            )}
            {success && (
              <div className="mb-4 rounded-md border border-[#067D62] bg-[#e6f4ea] p-3 text-sm text-[#067D62]">{success}</div>
            )}

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

            <form onSubmit={view === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              {view === 'signup' && (
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-[#0F1111]">Password</label>
                  {view === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchView('forgot')}
                      className="text-xs hover:underline"
                      style={{ color: '#007185' }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#879596' }} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={view === 'signup' ? 'At least 6 characters' : 'Your password'}
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
                {loading ? 'Please wait…' : view === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </>
        )}

        {!isReset && (
          <p className="text-xs text-center text-[#879596] mt-5">
            By continuing you agree to Amazon's conditions of use and privacy notice.
          </p>
        )}
      </div>
    </div>
  )
}
