function aqiTone(aqiLabel, avgAQI) {
  const label = (aqiLabel || '').toLowerCase()
  if (label.includes('good')) return 'emerald'
  if (label.includes('satisfactory')) return 'yellow'
  if (label.includes('moderate')) return 'orange'
  if (label.includes('poor')) return 'red'

  const v = Number(avgAQI)
  if (!Number.isFinite(v)) return 'slate'
  if (v <= 50) return 'emerald'
  if (v <= 100) return 'yellow'
  if (v <= 200) return 'orange'
  return 'red'
}

const TONES = {
  emerald: {
    ring: 'ring-emerald-400/30',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-50 border-emerald-300/20',
  },
  yellow: {
    ring: 'ring-yellow-400/30',
    dot: 'bg-yellow-300',
    badge: 'bg-yellow-500/15 text-yellow-50 border-yellow-300/20',
  },
  orange: {
    ring: 'ring-orange-400/30',
    dot: 'bg-orange-400',
    badge: 'bg-orange-500/15 text-orange-50 border-orange-300/20',
  },
  red: {
    ring: 'ring-red-400/30',
    dot: 'bg-red-400',
    badge: 'bg-red-500/15 text-red-50 border-red-300/20',
  },
  slate: {
    ring: 'ring-white/15',
    dot: 'bg-white/50',
    badge: 'bg-white/10 text-white/80 border-white/15',
  },
}

export default function RouteInfo({ bestRoute }) {
  const toneKey = aqiTone(bestRoute?.aqiLabel, bestRoute?.avgAQI)
  const tone = TONES[toneKey] ?? TONES.slate

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] p-3 md:p-5">
      <div className="pointer-events-auto mx-auto w-full max-w-3xl rounded-3xl border border-white/20 bg-white/10 p-4 shadow-soft backdrop-blur-xl md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-black/25 ring-1 ${tone.ring}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">
                  Best route ({bestRoute?.aqiLabel || 'AQI'})
                </div>
                <div className="text-xs text-white/60">
                  Balanced for time + air quality
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div
              className={`rounded-2xl border px-3 py-2 ${tone.badge}`}
              title="Average AQI"
            >
              <div className="text-[11px] opacity-80">AQI</div>
              <div className="text-base font-semibold leading-tight">
                {bestRoute?.avgAQI ?? '--'}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-black/20 px-3 py-2 text-white">
              <div className="text-[11px] text-white/60">Distance</div>
              <div className="text-base font-semibold leading-tight">
                {bestRoute?.distanceText || '--'}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-black/20 px-3 py-2 text-white">
              <div className="text-[11px] text-white/60">Duration</div>
              <div className="text-base font-semibold leading-tight">
                {bestRoute?.durationText || '--'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

