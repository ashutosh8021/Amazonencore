import { Component } from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * Catches render-time errors anywhere in the tree and shows a friendly fallback
 * instead of React unmounting to a blank white screen. Class component because
 * error boundaries have no hooks equivalent.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Log for debugging; in production this is where you'd report to a service.
    console.error('[ErrorBoundary] Caught a render error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{ minHeight: '100vh', backgroundColor: '#eaeded', color: '#0F1111' }}
        className="flex items-center justify-center px-4"
      >
        <div
          className="rounded-md bg-white p-8 max-w-md w-full text-center"
          style={{ border: '1px solid #D5D9D9' }}
        >
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-[#565959] mb-6">
            An unexpected error interrupted the page. Reloading usually fixes it. If
            it keeps happening, please try again in a moment.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-bold text-sm hover:brightness-95 transition-all"
            style={{ backgroundColor: '#FFD814', color: '#0F1111', border: 'none', cursor: 'pointer' }}
          >
            <RefreshCw size={16} />
            Reload page
          </button>
        </div>
      </div>
    )
  }
}
