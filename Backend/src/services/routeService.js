const geocodingService = require("./geocodingService");
const mapsService = require("./mapsService");
const polylineUtils = require("../utils/polylineUtils");
const aqiService = require("./aqiService");
const scoringService = require("./scoringService");

function getAQILabel(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  return "Very Poor";
}

async function getOptimalRoute(sourceInput, destinationInput, type) {
  try {
    // 1. Convert input → coordinates
    const [sourceCoords, destCoords] = await Promise.all([
      geocodingService.getCoordinates(sourceInput),
      geocodingService.getCoordinates(destinationInput),
    ]);

    // 2. Fetch routes
    const routes = await mapsService.getRoutes(sourceCoords, destCoords);

    // 3. Process each route
    const processedRoutes = await Promise.all(
      routes.map(async (route) => {
        try {
          // Decode polyline → points
          // Decode polyline
const points = polylineUtils.decodePolyline(route.polyline);

// Sample points for AQI + frontend
const sampledPoints = polylineUtils
  .samplePoints(points, 15)
  .map(([lat, lng]) => ({ lat, lng }));

// Get AQI
const avgAQI = await aqiService.getRouteAQI(sampledPoints);

          return {
            ...route,
            avgAQI,
          };
        } catch (err) {
          console.error("Error processing route:", err.message);

          // Fallback route (so one failure doesn't break everything)
          return {
            ...route,
            avgAQI: Infinity,
          };
        }
      })
    );

    // 4. Rank routes
    const { sortedRoutes, bestRoute } = scoringService.scoreRoutes(
  processedRoutes,
  type
);

return {
  selectedType: type,
  bestRoute: {
    ...bestRoute,
    distanceText: (bestRoute.distance / 1000).toFixed(2) + " km",
    durationText: Math.round(bestRoute.duration / 60) + " mins",
    avgAQI: bestRoute.avgAQI || 100,
  },
  alternatives: sortedRoutes.slice(1).map((route) => ({
    ...route,
    distanceText: (route.distance / 1000).toFixed(2) + " km",
    durationText: Math.round(route.duration / 60) + " mins",
    avgAQI: route.avgAQI || 100,
  })),
};
  } catch (error) {
    console.error("Route Service Error:", error.message);
    throw new Error("Failed to compute optimal route");
  }
}

module.exports = {
  getOptimalRoute,
};