import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const BANGALORE = { lat: 12.9716, lng: 77.5946 }

function FitToRoute({ coords }) {
  const map = useMap()

  useEffect(() => {
    if (!coords || coords.length < 2) return
    const bounds = L.latLngBounds(coords.map((c) => [c.lat, c.lng]))
    map.fitBounds(bounds, { padding: [48, 48] })
  }, [coords, map])

  return null
}

export default function Map({ coords, sourceLabel, destinationLabel }) {
  const path = useMemo(() => coords.map((c) => [c.lat, c.lng]), [coords])

  const start = coords?.length ? coords[0] : null
  const end = coords?.length ? coords[coords.length - 1] : null

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={[BANGALORE.lat, BANGALORE.lng]}
        zoom={12}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitToRoute coords={coords} />

        {path.length >= 2 ? (
          <>
            <Polyline
              positions={path}
              pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.9 }}
            />
            <Polyline
              positions={path}
              pathOptions={{ color: '#93c5fd', weight: 10, opacity: 0.35 }}
            />
          </>
        ) : null}

        {start ? <Marker position={[start.lat, start.lng]} /> : null}
        {end ? <Marker position={[end.lat, end.lng]} /> : null}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

      {sourceLabel || destinationLabel ? (
        <div className="pointer-events-none absolute left-4 bottom-4 hidden md:block">
          <div className="rounded-2xl border border-white/15 bg-black/35 px-3 py-2 text-xs text-white/85 backdrop-blur">
            {sourceLabel ? (
              <div className="truncate">
                <span className="text-white/60">From:</span> {sourceLabel}
              </div>
            ) : null}
            {destinationLabel ? (
              <div className="truncate">
                <span className="text-white/60">To:</span> {destinationLabel}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

