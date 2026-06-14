import { ShieldCheck, FileText, Lock, Leaf, Cpu } from 'lucide-react'

const reasons = [
  {
    icon: ShieldCheck,
    title: 'AI-verified listings',
    body: 'Every item graded by computer vision before it appears in the marketplace. No self-reported conditions.',
  },
  {
    icon: FileText,
    title: 'Honest condition reports',
    body: 'Flaws are named, not hidden. The listing AI is instructed to mention every observed defect — your trust depends on it.',
  },
  {
    icon: Lock,
    title: 'Secure transactions',
    body: 'Payments powered by Amazon Pay. Seller identity verified. Buyer protection on every purchase.',
  },
  {
    icon: Leaf,
    title: 'Sustainable by default',
    body: 'Carbon savings calculated and shown for every item. Green credits rewarded for every donation or recycle decision.',
  },
]

export default function Trust() {
  return (
    <section className="px-4 pb-10">
      <div className="max-w-[1500px] mx-auto">
        <div className="rounded-md border bg-white overflow-hidden" style={{ borderColor: '#D5D9D9' }}>
          <div className="p-6 md:p-8">
            <h2 style={{ color: '#0F1111' }} className="text-3xl font-bold mb-2">
              Why sellers and buyers trust Encore
            </h2>
            <p className="text-[#565959] mb-6">Built on Amazon infrastructure with explainable AI and visible condition evidence.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {reasons.map((reason) => (
                <div
                  key={reason.title}
                  className="rounded-md border p-5 flex flex-col gap-3 bg-[#FBFBFB]"
                  style={{ borderColor: '#D5D9D9' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#131921' }}
                  >
                    <reason.icon size={18} style={{ color: '#FF9900' }} />
                  </div>
                  <h3 className="font-bold text-base text-[#0F1111]">{reason.title}</h3>
                  <p className="text-sm text-[#565959] leading-relaxed">{reason.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 md:px-8 py-4 border-t flex items-center gap-2 bg-[#F7F8F8]" style={{ borderColor: '#D5D9D9' }}>
            <Cpu size={16} style={{ color: '#FF9900' }} />
            <span className="text-sm text-[#565959] font-medium">
              Powered by <span style={{ color: '#FF9900' }} className="font-semibold">Amazon Bedrock</span> for perception,
              with deterministic routing logic for the final disposition decision.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
