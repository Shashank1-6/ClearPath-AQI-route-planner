// controllers/routeController.js

const routeService = require("../services/routeService");

// Helper to parse "lat,lng"
const parseCoordinates = (coord) => {
    if (!coord) return null;

    const parts = coord.split(",");
    if (parts.length !== 2) return null;

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng)) return null;

    return { lat, lng };
};

exports.getRoute = async (req, res) => {
    try {
        const { source, destination, type } = req.query;

        // 🔹 Validate presence
        if (!source || !destination || !type) {
            return res.status(400).json({
                error: "Missing required query parameters: source, destination, type"
            });
        }

        // 🔹 Validate type
        const validTypes = ["fastest", "cleanest", "balanced"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: `Invalid type. Allowed values: ${validTypes.join(", ")}`
            });
        }

        // 🔹 Parse coordinates
        const parsedSource = parseCoordinates(source);
        const parsedDestination = parseCoordinates(destination);

        if (!parsedSource || !parsedDestination) {
            return res.status(400).json({
                error: "Invalid coordinates format. Use lat,lng"
            });
        }

        // 🔹 Call service layer
        const routeData = await routeService.getOptimalRoute(
            parsedSource,
            parsedDestination,
            type
        );

        // 🔹 Success response
        return res.status(200).json({
            success: true,
            data: routeData
        });

    } catch (error) {
        console.error("Route Controller Error:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};