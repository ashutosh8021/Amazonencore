import { Upload, ScanLine, GitBranch } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: 'Upload your product',
    body: 'Take a photo of your returned or unused item. Our vision AI reads every detail — scuffs, missing parts, packaging condition — so you don\'t have to describe anything.',
  },
  {
    icon: ScanLine,
    title: 'AI assessment',
    body: 'Amazon Bedrock grades your item against Amazon\'s four-tier standard (Like New / Very Good / Good / Acceptable) and produces a condition report with a confidence score.',
  },
  {
    icon: GitBranch,
    title: 'Second-life decision',
    body: 'Our decision engine calculates recovered value minus processing cost and carbon impact, then picks the optimal route — and shows you every number so you can trust the outcome.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 pb-10">
      <div className="max-w-[1500px] mx-auto">
        <div className="rounded-md border bg-white p-6 md:p-8" style={{ borderColor: '#D5D9D9' }}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <h2 style={{ color: '#0F1111' }} className="text-3xl font-bold mb-2">
                How Encore works
              </h2>
              <p className="text-[#565959]">Three steps from photo upload to the best second-life route.</p>
            </div>
            <p className="text-sm text-[#007185] font-semibold">Presentation in the browser. Decisions on our API.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-md border p-5 flex flex-col gap-4 bg-[#FBFBFB]"
                style={{ borderColor: '#D5D9D9' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#FFD814' }}
                  >
                    <step.icon size={18} style={{ color: '#0F1111' }} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#879596]">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0F1111]">{step.title}</h3>
                <p className="text-sm text-[#565959] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
