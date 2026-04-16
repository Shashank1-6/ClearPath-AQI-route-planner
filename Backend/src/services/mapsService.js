const axios = require("axios");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getRoutes(sourceCoords, destCoords) {
  try {
    const { lat: srcLat, lng: srcLng } = sourceCoords;
    const { lat: destLat, lng: destLng } = destCoords;

    const url = "https://maps.googleapis.com/maps/api/directions/json";

    const response = await axios.get(url, {
      params: {
        origin: `${srcLat},${srcLng}`,
        destination: `${destLat},${destLng}`,
        alternatives: true,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status !== "OK") {
      throw new Error(`Maps API Error: ${response.data.status}`);
    }

    const routes = response.data.routes;

    const formattedRoutes = routes.map(route => {
      const leg = route.legs[0]; // usually single leg

      return {
        polyline: route.overview_polyline.points,
        distance: leg.distance.value, // in meters
        duration: leg.duration.value  // in seconds
      };
    });

    return formattedRoutes;

  } catch (error) {
    console.error("Error in getRoutes:", error.message);

    throw new Error("Failed to fetch routes from Maps API");
  }
}

module.exports = {
  getRoutes
};