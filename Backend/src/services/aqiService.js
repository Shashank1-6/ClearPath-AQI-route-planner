const axios = require("axios");

// ===== CONFIG =====
const WAQI_API_KEY = process.env.WAQI_API_KEY;
const BASE_URL = "https://api.waqi.info/map/bounds";

// In-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ===== HELPER: Round coordinates for caching =====
function getCacheKey(lat, lng) {
  const roundedLat = lat.toFixed(2);
  const roundedLng = lng.toFixed(2);
  return `${roundedLat},${roundedLng}`;
}

// ===== HELPER: Distance (Haversine) =====
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ===== MAIN FUNCTION =====
async function getAQI(lat, lng) {
  const cacheKey = getCacheKey(lat, lng);

  // 1. Check cache
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }

  try {
    // 2. Fetch nearby stations (small bounding box)
    const delta = 0.5; // ~50km range
    const url = `${BASE_URL}?token=${WAQI_API_KEY}&latlng=${lat - delta},${lng - delta},${lat + delta},${lng + delta}`;

    const response = await axios.get(url);

    if (response.data.status !== "ok") {
      throw new Error("WAQI API failed");
    }

    const stations = response.data.data;

    // 3. Filter valid stations
    const validStations = stations.filter(
      (s) => s.aqi !== "-" && s.lat && s.lon
    );

    if (validStations.length === 0) {
      throw new Error("No valid AQI stations");
    }

    let numerator = 0;
    let denominator = 0;

    let nearestStation = null;
    let minDistance = Infinity;

    // 4. Weighted average calculation
    for (const station of validStations) {
      const stationAQI = Number(station.aqi);
      const distance = getDistance(lat, lng, station.lat, station.lon);

      // Edge case: exact match
      if (distance === 0) {
        return stationAQI;
      }

      // Track nearest
      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = stationAQI;
      }

      numerator += stationAQI / distance;
      denominator += 1 / distance;
    }

    let estimatedAQI;

    if (denominator === 0) {
      // fallback
      estimatedAQI = nearestStation;
    } else {
      estimatedAQI = numerator / denominator;
    }

    estimatedAQI = Math.round(estimatedAQI);

    // 5. Save to cache
    cache.set(cacheKey, {
      data: estimatedAQI,
      timestamp: Date.now(),
    });

    return estimatedAQI;
  } catch (error) {
    console.error("AQI Service Error:", error.message);

    // fallback: return null or default
    return null;
  }
}

module.exports = {
  getAQI,
};