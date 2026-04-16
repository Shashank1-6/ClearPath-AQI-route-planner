// controllers/routeController.js

const routeService = require("../services/routeService");

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

        // 🔹 Call service directly (no parsing here anymore)
        const routeData = await routeService.getOptimalRoute(
            source,
            destination,
            type
        );

        return res.status(200).json({
            success: true,
            data: routeData
        });

    } catch (error) {
        console.error("Route Controller Error:", error);

        return res.status(500).json({
            error: error.message || "Internal Server Error"
        });
    }
};