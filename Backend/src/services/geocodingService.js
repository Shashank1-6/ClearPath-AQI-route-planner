const axios = require("axios");

// Simple in-memory cache
const cache = new Map();

// Regex to detect "lat,lng"
const COORD_REGEX = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

const GOOGLE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

/**
 * Convert input (place name or lat,lng string) → coordinates
 * @param {string} input
 * @returns {{ lat: number, lng: number }}
 */
async function getCoordinates(input) {
  try {
    // 🔹 Validation
    if (!input || typeof input !== "string") {
      throw new Error("Invalid input: must be a non-empty string");
    }

    const trimmedInput = input.trim();

    if (!trimmedInput) {
      throw new Error("Invalid input: empty string");
    }

    // 🔹 Case 1: Already coordinates
    if (COORD_REGEX.test(trimmedInput)) {
      const [lat, lng] = trimmedInput.split(",").map(Number);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinate format");
      }

      return { lat, lng };
    }

    // 🔹 Case 2: Check cache
    if (cache.has(trimmedInput)) {
      return cache.get(trimmedInput);
    }

    // 🔹 Case 3: Call Google Geocoding API
    const response = await axios.get(GOOGLE_GEOCODING_URL, {
      params: {
        address: trimmedInput,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (!response.data || response.data.status !== "OK") {
      throw new Error(
        `Geocoding API error: ${response.data.status || "Unknown error"}`
      );
    }

    const results = response.data.results;

    if (!results || results.length === 0) {
      throw new Error("No results found for the given location");
    }

    const location = results[0].geometry.location;

    const coordinates = {
      lat: location.lat,
      lng: location.lng,
    };

    // 🔹 Store in cache
    cache.set(trimmedInput, coordinates);

    return coordinates;
  } catch (error) {
    // Normalize errors
    throw new Error(`Geocoding failed: ${error.message}`);
  }
}

module.exports = {
  getCoordinates,
};