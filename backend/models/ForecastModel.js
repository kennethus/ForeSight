const mongoose = require("mongoose");

const ForecastSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  es_success: {
    type: Boolean,
    required: true,
  },
  rf_total: {
    type: Number,
    required: true,
  },
  combined_total: Number, // Optional
  es_r2_score: Number, // Optional
  categories: {
    Living_Expenses: Number,
    Food_and_Dining_Expenses: Number,
    Transportation_Expenses: Number,
    Leisure_and_Entertainment_Expenses: Number,
    Academic_Expenses: Number,
  },
  es_prediction: {
    success: Boolean,
    forecast: [Number],
    dates: [String],
    metrics: {
      mae: Number,
      rmse: Number,
      r2: Number,
      total_forecasted: Number,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ForecastModel = mongoose.model("Forecast", ForecastSchema);

module.exports = ForecastModel;
