const Forecast = require("../models/ForecastModel");
const mongoose = require("mongoose");

const saveForecast = async (req, res) => {
  try {
    const userId = req.user._id; // or from req.body.userId

    const forecast = new Forecast({
      userId,
      ...req.body, // spreads all fields like es_success, rf_total, etc.
    });

    await forecast.save();
    res.status(201).json({ success: true, data: forecast });
  } catch (err) {
    console.error("Failed to save forecast:", err);
    res.status(500).json({ success: false, message: "Error saving forecast" });
  }
};

const getPreviousForecastByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid user ID" });
    }

    // Get the most recent forecast by creation date
    const latestForecast = await Forecast.findOne({ userId }).sort({
      createdAt: -1,
    }); // sorting to get the latest

    if (!latestForecast) {
      return res
        .status(200)
        .json({ success: false, message: "No forecast found for user" });
    }

    res.status(200).json({ success: true, data: latestForecast });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching forecast",
      error: error.message,
    });
  }
};

module.exports = { saveForecast, getPreviousForecastByUser };
