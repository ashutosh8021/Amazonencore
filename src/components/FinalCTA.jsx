export default function FinalCTA({ onGetStarted }) {
  return (
    <section style={{ backgroundColor: '#131921' }} className="py-14 px-4">
      <div className="max-w-[1500px] mx-auto">
        <div className="rounded-md border border-white/10 px-6 py-10 md:px-10 md:py-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to give your product a second life?
          </h2>
          <p className="text-[#D5D9D9] text-lg mb-8 max-w-2xl mx-auto">
            Upload a photo, get an instant AI condition grade, see the value-versus-cost math, and let
            Encore route the item to resale, donation, or recycling.
          </p>
          <button
            type="button"
            onClick={onGetStarted}
            style={{ backgroundColor: '#FFD814', color: '#0F1111' }}
            className="px-10 py-3.5 rounded-full font-bold text-base hover:brightness-95 transition-all shadow-lg"
          >
            Sell a product
          </button>
        </div>
      </div>
    </section>
  )
}
