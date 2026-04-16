const express = require("express");
const router = express.Router();

const routeController = require("../controllers/routeController");

// GET /route?source=&destination=&type=
router.get("/route", routeController.getRoute);

module.exports = router;