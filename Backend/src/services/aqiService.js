const axios = require("axios");

// ===== CONFIG =====
const WAQI_API_KEY = process.env.WAQI_API_KEY;
const BASE_URL = "https://api.waqi.info/feed/geo:";

// Cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 min

// ===== HELPER: Cache key =====
function getCacheKey(lat, lng) {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

// ===== HELPER: Delay =====
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===== HELPER: Fetch AQI for single point =====
async function fetchAQI(lat, lng) {
  const key = getCacheKey(lat, lng);

  // Cache check
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }

  try {
    const url = `${BASE_URL}${lat};${lng}/?token=${WAQI_API_KEY}`;
    const response = await axios.get(url);

    if (response.data.status !== "ok") {
      throw new Error("Invalid WAQI response");
    }

    const aqi = response.data.data.aqi;

    const value = typeof aqi === "number" ? aqi : null;

    cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });

    return value;
  } catch (err) {
    console.error("AQI fetch error:", err.message);
    return null;
  }
}

// ===== MAIN FUNCTION (UPDATED LOGIC) =====
async function getRouteAQI(points) {
  if (!points || points.length === 0) return null;

  // 1. Pick representative points
  const start = points[0];
  const mid = points[Math.floor(points.length / 2)];
  const end = points[points.length - 1];

  const selectedPoints = [start, mid, end];

  const results = [];

  // 2. Sequential calls with delay
  for (let i = 0; i < selectedPoints.length; i++) {
   const { lat, lng } = selectedPoints[i];

    const aqi = await fetchAQI(lat, lng);
    if (aqi !== null) {
      results.push(aqi);
    }

    // delay (avoid 429)
    if (i < selectedPoints.length - 1) {
      await sleep(800 + Math.random() * 200);
    }
  }

  // 3. Fallback if all failed
  if (results.length === 0) {
    return 100; // safe default
  }

  // 4. Weighted average (midpoint more important)
  if (results.length === 3) {
    const [a, b, c] = results;
    return Math.round((a + 2 * b + c) / 4);
  }

  // fallback: simple average
  const avg =
    results.reduce((sum, val) => sum + val, 0) / results.length;

  return Math.round(avg);
}

module.exports = {
  getRouteAQI,
};