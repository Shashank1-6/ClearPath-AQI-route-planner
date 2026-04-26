import { useMemo, useState } from 'react'
import axios from 'axios'
import polyline from '@mapbox/polyline'

import Map from './Map.jsx'
import SearchPanel from './SearchPanel.jsx'
import RouteInfo from './RouteInfo.jsx'

function App() {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [type, setType] = useState('balanced')

  const [routeResponse, setRouteResponse] = useState(null)
  const [routeCoords, setRouteCoords] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bestRoute = routeResponse?.bestRoute ?? null

  const canSearch = useMemo(() => {
    return source.trim().length > 0 && destination.trim().length > 0 && !loading
  }, [source, destination, loading])

  async function onFindRoute() {
    if (!canSearch) return

    setError('')
    setLoading(true)
    setRouteResponse(null)
    setRouteCoords([])

    try {
      const res = await axios.get('http://localhost:3000/api/route', {
        params: {
          source: source.trim(),
          destination: destination.trim(),
          type,
        },
      })

      const data = res.data?.data
      const encoded = data?.bestRoute?.polyline

      if (!encoded || typeof encoded !== 'string') {
        throw new Error('Route polyline was missing in the response.')
      }

      const decoded = polyline.decode(encoded,6) // [ [lat,lng], ... ]
      const coords = decoded.map(([lat, lng]) => ({ lat, lng }))

      setRouteResponse(data)
      setRouteCoords(coords)
    } catch (e) {
      setError(
        'We couldn’t fetch a route right now. Please check the locations and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_15%_10%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(900px_450px_at_80%_15%,rgba(16,185,129,0.16),transparent_55%),radial-gradient(800px_500px_at_50%_90%,rgba(168,85,247,0.14),transparent_60%)]" />

      <Map
        coords={routeCoords}
        sourceLabel={source}
        destinationLabel={destination}
      />

      <SearchPanel
        source={source}
        destination={destination}
        type={type}
        loading={loading}
        error={error}
        onChangeSource={setSource}
        onChangeDestination={setDestination}
        onChangeType={setType}
        onSubmit={onFindRoute}
        canSubmit={canSearch}
      />

      {bestRoute ? <RouteInfo bestRoute={bestRoute} /> : null}
    </div>
  )
}

export default App
