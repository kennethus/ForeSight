const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const {
  saveForecast,
  getPreviousForecastByUser,
} = require("../controllers/forecastController");

const router = express.Router();

router.get("/getPreviousForecast", authenticate, getPreviousForecastByUser);
router.post("/saveForest", authenticate, saveForecast);

//export all router
module.exports = router;
