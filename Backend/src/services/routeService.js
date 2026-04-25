const geocodingService = require("./geocodingService");
const mapsService = require("./mapsService");
const polylineUtils = require("../utils/polylineUtils");
const aqiService = require("./aqiService");
const scoringService = require("./scoringService");

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
          const points = polylineUtils.decodePolyline(route.polyline);

          // Sample points (reduce API calls)
          const sampledPoints = polylineUtils.samplePoints(points,15);

          // Fetch AQI for all points in parallel
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
  bestRoute,
  alternatives: sortedRoutes.slice(1),
};
  } catch (error) {
    console.error("Route Service Error:", error.message);
    throw new Error("Failed to compute optimal route");
  }
}

module.exports = {
  getOptimalRoute,
};