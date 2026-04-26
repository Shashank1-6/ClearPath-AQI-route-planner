// utils/polylineUtils.js

/**
 * Decodes a Mapbox encoded polyline (precision = 6)
 * Returns array of [lat, lng]
 */
function decodePolyline(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = null;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += deltaLat;

    // Decode longitude
    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += deltaLng;

    // 🔥 FIX 1: precision = 6
    // 🔥 FIX 2: return [lat, lng]
    points.push([lat / 1e6, lng / 1e6]);
  }

  return points;
}

/**
 * Samples points to reduce dataset size
 * Works with [lat, lng]
 */
function samplePoints(points, step = 5) {
  if (!Array.isArray(points) || points.length === 0) return [];

  const sampled = [];

  for (let i = 0; i < points.length; i += step) {
    sampled.push(points[i]);
  }

  // Ensure last point is included
  const lastPoint = points[points.length - 1];
  if (sampled[sampled.length - 1] !== lastPoint) {
    sampled.push(lastPoint);
  }

  return sampled;
}

module.exports = {
  decodePolyline,
  samplePoints,
};