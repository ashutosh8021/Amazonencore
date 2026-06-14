const roadmap = [
  'AI pricing engine',
  'Instant buyback',
  'Green credits',
  'Product verification',
  'Carbon savings dashboard',
  'Seller trust score',
]

export default function Footer() {
  return (
    <footer>
      <a
        href="#"
        className="block px-4 py-4 text-center text-sm text-white hover:brightness-110 transition-all"
        style={{ backgroundColor: '#37475A' }}
      >
        Back to top
      </a>

      <div style={{ backgroundColor: '#232F3E' }} className="px-4 py-10">
        <div className="max-w-[1500px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            {/* Amazon.in logo — matches TopNav */}
            <div className="mb-1 select-none">
              <svg viewBox="0 0 110 42" width="80" height="30" aria-hidden="true">
                <text x="2" y="24" fill="white" fontSize="23" fontWeight="900" fontFamily="'Arial Black', Arial, sans-serif" letterSpacing="-0.8">amazon</text>
                <path d="M5 31 C28 43 72 43 95 31" stroke="#FF9900" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <path d="M92 28 L97 31 L91 34" fill="#FF9900" />
                <text x="97" y="41" fill="#FF9900" fontSize="9" fontWeight="700" fontFamily="Arial, sans-serif">.in</text>
              </svg>
            </div>
            <p className="text-[#879596] text-xs mb-3">Encore · A program by Amazon India</p>
            <p className="text-[#D5D9D9] text-sm leading-relaxed">
              AI-powered recommerce inside Amazon&apos;s ecosystem. Every product deserves another chance.
            </p>
          </div>

          <div>
            <p className="text-white font-semibold text-sm mb-3">Company</p>
            <ul className="space-y-2 text-sm text-[#D5D9D9]">
              {['About', 'Privacy', 'Terms', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:underline">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white font-semibold text-sm mb-3">Encore experience</p>
            <ul className="space-y-2 text-sm text-[#D5D9D9]">
              {['Sell a product', 'Marketplace', 'Condition reports', 'Green credits'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:underline">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white font-semibold text-sm mb-3">Coming soon</p>
            <div className="flex flex-wrap gap-2">
              {roadmap.map((item) => (
                <span
                  key={item}
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{ borderColor: '#4B5C6D', color: '#D5D9D9' }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#131A22' }} className="px-4 py-4">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#D5D9D9]">
          <span>© {new Date().getFullYear()} Amazon.com, Inc. or its affiliates.</span>
          <span style={{ color: '#879596' }}>Amazon Encore · Built for HackOn with Amazon Season 6.0</span>
        </div>
      </div>
    </footer>
  )
}
