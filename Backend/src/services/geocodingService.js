const axios = require("axios");

// In-memory cache
const cache = new Map();

// Detect "lat,lng"
const COORD_REGEX = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

const MAPBOX_GEOCODING_URL =
  "https://api.mapbox.com/geocoding/v5/mapbox.places";

async function getCoordinates(input) {
  try {
    // 🔹 Validation
    if (!input || typeof input !== "string") {
      throw new Error("Invalid input");
    }

    const trimmedInput = input.trim();

    if (!trimmedInput) {
      throw new Error("Empty input");
    }

    // 🔹 Case 1: Already coordinates
    if (COORD_REGEX.test(trimmedInput)) {
      const [lat, lng] = trimmedInput.split(",").map(Number);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinate format");
      }

      return { lat, lng };
    }

    // 🔹 Case 2: Cache
    if (cache.has(trimmedInput)) {
      return cache.get(trimmedInput);
    }

    // 🔹 Case 3: Mapbox API call
    const response = await axios.get(
      `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(trimmedInput)}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          limit: 1,
        },
      }
    );

    const data = response.data;

    if (!data.features || data.features.length === 0) {
      throw new Error("No results found");
    }

    // ⚠️ Mapbox returns [lng, lat]
    const [lng, lat] = data.features[0].center;

    const coordinates = { lat, lng };

    // 🔹 Cache result
    cache.set(trimmedInput, coordinates);

    return coordinates;
  } catch (error) {
    throw new Error(`Geocoding failed: ${error.message}`);
  }
}

module.exports = {
  getCoordinates,
};