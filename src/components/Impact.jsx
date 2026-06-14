const stats = [
  { value: '12K+', label: 'Products rescued', note: 'Real items given second lives' },
  { value: '48 tons', label: 'Waste prevented', note: 'CO2-equivalent diverted from landfill' },
  { value: '₹1.8 Cr', label: 'Value recovered', note: 'Returned to sellers and customers' },
  { value: '96%', label: 'Successful matches', note: 'Items routed to the right destination' },
]

export default function Impact() {
  return (
    <section id="impact" className="px-4 pb-10">
      <div className="max-w-[1500px] mx-auto">
        <div className="rounded-md border bg-white p-6 md:p-8" style={{ borderColor: '#D5D9D9' }}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <h2 style={{ color: '#0F1111' }} className="text-3xl font-bold mb-2">
                Impact at a glance
              </h2>
              <p className="text-[#565959]">Every number ties to a real item that did not become waste.</p>
            </div>
            <p className="text-sm text-[#007185] font-semibold">Measured through live item outcomes</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-md border p-5 bg-[#FBFBFB]"
                style={{ borderColor: '#D5D9D9' }}
              >
                <p className="text-4xl font-extrabold mb-1" style={{ color: '#FF9900' }}>{stat.value}</p>
                <p className="font-semibold text-sm mb-1" style={{ color: '#0F1111' }}>{stat.label}</p>
                <p className="text-xs text-[#565959]">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
