// scoringService.js

function normalize(values) {
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Avoid division by zero if all values are same
    if (max === min) {
        return values.map(() => 0);
    }

    return values.map(v => (v - min) / (max - min));
}

function scoreRoutes(routes, type) {
    if (!routes || routes.length === 0) {
        return { sortedRoutes: [], bestRoute: null };
    }

    // Extract values
    const aqiValues = routes.map(r => r.avgAQI);
    const durationValues = routes.map(r => r.duration);

    // Normalize for balanced mode
    const normAQI = normalize(aqiValues);
    const normDuration = normalize(durationValues);

    const scoredRoutes = routes.map((route, index) => {
        let score;

        switch (type) {
            case "cleanest":
                score = route.avgAQI; // lower is better
                break;

            case "fastest":
                score = route.duration; // lower is better
                break;

            case "balanced":
                score = 0.6 * normAQI[index] + 0.4 * normDuration[index];
                break;

            default:
                score = route.duration;
        }

        return {
            ...route,
            score
        };
    });

    // Sort ascending (lower score = better route)
    scoredRoutes.sort((a, b) => a.score - b.score);

    return {
        sortedRoutes: scoredRoutes,
        bestRoute: scoredRoutes[0]
    };
}

module.exports = {
    scoreRoutes
};