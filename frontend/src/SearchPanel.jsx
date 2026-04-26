function Spinner() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <span className="text-sm">Finding route…</span>
    </span>
  )
}

export default function SearchPanel({
  source,
  destination,
  type,
  loading,
  error,
  onChangeSource,
  onChangeDestination,
  onChangeType,
  onSubmit,
  canSubmit,
}) {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-[1000] p-3 md:p-5">
      <div className="pointer-events-auto mx-auto w-full max-w-3xl rounded-3xl border border-white/20 bg-white/10 p-4 shadow-soft backdrop-blur-xl md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-white/90">
              AQI Route Planner
            </div>
            <div className="text-xs text-white/60">
              Cleaner routes without losing time.
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
            Bangalore (default view)
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_170px_140px] md:items-end">
          <label className="block">
            <div className="mb-1 text-xs font-medium text-white/70">Source</div>
            <input
              value={source}
              onChange={(e) => onChangeSource(e.target.value)}
              placeholder="e.g. Indiranagar"
              className="w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/35 focus:bg-black/30"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-white/70">
              Destination
            </div>
            <input
              value={destination}
              onChange={(e) => onChangeDestination(e.target.value)}
              placeholder="e.g. MG Road"
              className="w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/35 focus:bg-black/30"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-white/70">
              Route type
            </div>
            <select
              value={type}
              onChange={(e) => onChangeType(e.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-white/35 focus:bg-black/30"
            >
              <option value="fastest">Fastest</option>
              <option value="cleanest">Cleanest</option>
              <option value="balanced">Balanced</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="group w-full rounded-2xl bg-gradient-to-b from-blue-400 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-soft transition active:scale-[0.99] disabled:cursor-not-allowed disabled:from-white/15 disabled:to-white/10 disabled:text-white/60"
          >
            {loading ? <Spinner /> : 'Find Route'}
          </button>
        </div>

        {error ? (
          <div className="mt-3 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}

