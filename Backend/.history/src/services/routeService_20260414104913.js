const geocodingService = require("./geocodingService");
const mapsService = require("./mapsService");
const polylineUtils = require("./polylineUtils");
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
          const sampledPoints = polylineUtils.samplePoints(points);

          // Fetch AQI for all points in parallel
          const aqiValues = await Promise.all(
            sampledPoints.map((point) =>
              aqiService.getAQI(point.lat, point.lng)
            )
          );

          // Compute average AQI
          const validAQI = aqiValues.filter((val) => val !== null);
          const avgAQI =
            validAQI.length > 0
              ? validAQI.reduce((sum, val) => sum + val, 0) /
                validAQI.length
              : Infinity;

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
    const rankedRoutes = scoringService.scoreRoutes(
      processedRoutes,
      type
    );

    // 5. Return best + alternatives
    return {
      selectedType: type,
      bestRoute: rankedRoutes[0],
      alternatives: rankedRoutes.slice(1),
    };
  } catch (error) {
    console.error("Route Service Error:", error.message);
    throw new Error("Failed to compute optimal route");
  }
}

module.exports = {
  getOptimalRoute,
};