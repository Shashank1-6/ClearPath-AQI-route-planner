// utils/polyline.js

/**
 * Decodes a Google encoded polyline into an array of [lat, lng]
 * @param {string} encoded
 * @returns {Array<[number, number]>}
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

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

/**
 * Samples points to reduce dataset size
 * @param {Array<[number, number]>} points
 * @param {number} step (default = 5)
 * @returns {Array<[number, number]>}
 */
function samplePoints(points, step = 5) {
  if (!Array.isArray(points) || points.length === 0) return [];

  const sampled = [];

  for (let i = 0; i < points.length; i += step) {
    sampled.push(points[i]);
  }

  // Ensure last point (destination) is always included
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