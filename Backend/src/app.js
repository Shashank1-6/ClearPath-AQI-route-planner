const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const routeRoutes = require("./routes/route");
app.use("/api", routeRoutes);

// Health check (optional but useful)
app.get("/", (req, res) => {
  res.send("AQI Route Planner Backend is running 🚀");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});