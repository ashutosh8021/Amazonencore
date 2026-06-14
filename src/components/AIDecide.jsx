import { TrendingUp, Heart, BookOpen } from 'lucide-react'

export default function AIDecide() {
  return (
    <section id="ai-decide" className="px-4 pb-10">
      <div className="max-w-[1500px] mx-auto grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-md border bg-white p-6" style={{ borderColor: '#D5D9D9' }}>
          <h2 style={{ color: '#0F1111' }} className="text-3xl font-bold mb-3">
            See the AI decide
          </h2>
          <p className="text-[#565959] leading-relaxed mb-5">
            Encore does not just grade condition. It explains whether relisting creates value, or whether
            donation is the better customer outcome.
          </p>
          <div className="rounded-md border bg-[#FBFBFB] p-4 text-sm text-[#565959]" style={{ borderColor: '#D5D9D9' }}>
            The contrast matters:
            premium items become verified listings, while low-value items can earn green credits instead of forcing a bad resale.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-md border bg-white p-6 flex flex-col gap-4" style={{ borderColor: '#D5D9D9' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#879596] mb-1">High-value item</p>
                <p className="font-bold text-xl text-[#0F1111]">AirPods Pro (2nd gen)</p>
                <p className="text-sm text-[#565959]">Original price: ₹24,900 · Grade: Very Good</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#e6f4ea' }}
              >
                <TrendingUp size={22} style={{ color: '#067D62' }} />
              </div>
            </div>

            <div className="rounded-md border bg-[#F7F8F8] p-4" style={{ borderColor: '#D5D9D9' }}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-3">Decision math</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#565959]">Expected resale value (55%)</span>
                  <span className="font-semibold text-[#0F1111]">₹13,695</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#565959]">Processing cost</span>
                  <span className="font-semibold text-[#B12704]">− ₹350</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2" style={{ borderColor: '#D5D9D9' }}>
                  <span className="font-semibold text-[#0F1111]">Net value</span>
                  <span className="font-bold text-[#067D62]">₹13,345</span>
                </div>
              </div>
            </div>

            <div className="rounded-md px-4 py-3 flex items-center gap-2" style={{ backgroundColor: '#067D62' }}>
              <TrendingUp size={16} className="text-white" />
              <span className="text-white font-bold">Resell at ₹12,500</span>
              <span className="text-[#C8F3D2] text-sm ml-auto">97 confidence</span>
            </div>
            <p className="text-sm text-[#565959]">
              Net value comfortably covers inspection and relisting, so Encore generates the listing automatically.
            </p>
          </div>

          <div className="rounded-md border bg-white p-6 flex flex-col gap-4" style={{ borderColor: '#D5D9D9' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#879596] mb-1">Long-tail item</p>
                <p className="font-bold text-xl text-[#0F1111]">Running shoe (used)</p>
                <p className="text-sm text-[#565959]">Original price: ₹500 · Grade: Good</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#fff3e0' }}
              >
                <Heart size={22} style={{ color: '#FF9900' }} />
              </div>
            </div>

            <div className="rounded-md border bg-[#F7F8F8] p-4" style={{ borderColor: '#D5D9D9' }}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-3">Decision math</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#565959]">Expected resale value (40%)</span>
                  <span className="font-semibold text-[#0F1111]">₹200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#565959]">Processing cost</span>
                  <span className="font-semibold text-[#B12704]">− ₹250</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2" style={{ borderColor: '#D5D9D9' }}>
                  <span className="font-semibold text-[#0F1111]">Net resell</span>
                  <span className="font-bold text-[#B12704]">− ₹50</span>
                </div>
              </div>
            </div>

            <div className="rounded-md px-4 py-3 flex items-center gap-2" style={{ backgroundColor: '#FF9900' }}>
              <Heart size={16} className="text-white" />
              <span className="text-white font-bold">Donate + earn green credits</span>
            </div>

            <div
              className="rounded-md border px-4 py-3 text-sm text-[#565959] leading-relaxed"
              style={{ borderColor: '#D5D9D9', backgroundColor: '#fffbf0' }}
            >
              <span className="font-semibold text-[#0F1111]">Why not resell?</span> Relisting costs ₹250 but
              recovers only ₹200, so the decision engine chooses a donation route and awards 24 green credits.
            </div>
          </div>

          {/* Book example — full width below the two-column grid */}
          <div className="rounded-md border bg-white p-6 flex flex-col gap-4 mt-4" style={{ borderColor: '#D5D9D9' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#879596] mb-1">Where it all started</p>
                <p className="font-bold text-xl text-[#0F1111]">Atomic Habits — James Clear (Paperback)</p>
                <p className="text-sm text-[#565959]">Original price: ₹799 · Grade: Very Good</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#e0f0f3' }}
              >
                <BookOpen size={22} style={{ color: '#007185' }} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-md border bg-[#F7F8F8] p-4" style={{ borderColor: '#D5D9D9' }}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-3">Decision math</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#565959]">Expected resale value (55%)</span>
                    <span className="font-semibold text-[#0F1111]">₹440</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#565959]">Processing cost</span>
                    <span className="font-semibold text-[#B12704]">− ₹80</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2" style={{ borderColor: '#D5D9D9' }}>
                    <span className="font-semibold text-[#0F1111]">Net value</span>
                    <span className="font-bold text-[#067D62]">₹360</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 justify-between">
                <div className="rounded-md px-4 py-3 flex items-center gap-2" style={{ backgroundColor: '#067D62' }}>
                  <BookOpen size={16} className="text-white" />
                  <span className="text-white font-bold">Resell at ₹350</span>
                  <span className="text-[#C8F3D2] text-sm ml-auto">89 confidence</span>
                </div>

                <div
                  className="rounded-md border px-4 py-3 text-sm text-[#565959] leading-relaxed"
                  style={{ borderColor: '#D5D9D9', backgroundColor: '#FBFBFB' }}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596] mb-1">Book condition</p>
                  <p>Spine intact, minor pencil notes on 3 pages, cover in excellent condition</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#565959] leading-relaxed">
              Amazon started by selling books. Encore makes sure pre-loved copies keep finding readers instead of landfills.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
