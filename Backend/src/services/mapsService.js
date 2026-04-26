const axios = require("axios");

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

async function getRoutes(sourceCoords, destCoords) {
  try {
    const { lat: srcLat, lng: srcLng } = sourceCoords;
    const { lat: destLat, lng: destLng } = destCoords;

    // Mapbox expects lng,lat (IMPORTANT)
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${srcLng},${srcLat};${destLng},${destLat}`;

    const response = await axios.get(url, {
      params: {
        alternatives: true,
        geometries: "polyline6", // keeps same format as Google
        overview: "full",
        access_token: MAPBOX_API_KEY
      }
    });

    if (!response.data || !response.data.routes) {
      throw new Error("Invalid response from Mapbox Directions API");
    }

    const routes = response.data.routes;

    const formattedRoutes = routes.map(route => {
      return {
        polyline: route.geometry,        // already encoded polyline
        distance: route.distance,        // meters
        duration: route.duration         // seconds
      };
    });

    return formattedRoutes;

  } catch (error) {
    console.error("Maps Service Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch routes from Mapbox API");
  }
}

module.exports = {
  getRoutes
};