const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Personal Information
    yearLevel: {
      type: String, // Freshman, Sophomore, Junior, Senior, Graduate
      required: true,
    },
    personality: {
      type: String,
      required: true,
      trim: true,
    },
    inRelationship: {
      type: Boolean,
      require: true,
    },
    homeRegion: {
      type: String,
      required: true,
      trim: true,
    },

    // Living Situation
    livingSituation: {
      type: String, // Dorm, Apartment, Boarding House, Family Home, etc.
      required: true,
      trim: true,
    },
    dormArea: {
      type: String,
      required: true,
      trim: true,
    },
    numberOfRoommates: {
      //range
      type: String,
      required: true,
    },

    // Academic & Organization
    degreeProgram: {
      type: String,
      required: true,
      trim: true,
    },
    haveOrganization: {
      type: Boolean,
      required: true,
    },
    studyHoursPerWeek: {
      //range
      type: String,
      required: true,
    },

    // Financial Situation
    monthlyAllowance: {
      type: Number,
      required: true,
      min: 0,
    },
    familyMonthlyIncome: {
      //string
      type: String,
      required: true,
    },
    hasScholarship: {
      type: Boolean,
      required: true,
    },
    hasJobOrBusiness: {
      type: Boolean,
      required: true,
    },

    // Lifestyle & Spending
    mealPreferences: {
      type: String,
      required: true,
      trim: true,
    },
    frequencyGoingHomePerSemester: {
      type: String,
      required: true,
      trim: true,
    },
    preferredPaymentMethod: {
      type: String,
      required: true,
      trim: true,
    },

    // Health & Concerns
    hasHealthConcerns: {
      type: Boolean,
      required: true,
    },
    healthConcernDetails: {
      type: String,
      trim: true, // Optional field for specifying concerns
      default: "None",
    },

    // Financial Habits
    hasTrackExpensesBefore: {
      type: Boolean,
      required: true,
    },

    trackedExpense: {
      type: String, //URL
      trim: true,
      default: "None",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

module.exports = mongoose.model("Feature", FeatureSchema);
