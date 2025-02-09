const mongoose = require('mongoose');

const FeatureSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Personal Information
    yearLevel: {
      type: Number,
      required: true,
      min: 1,
    },
    degreeProgram: {
      type: String,
      required: true,
      trim: true,
    },
    familyIncome: {
      type: Number,
      required: true,
      min: 0,
    },

    // Personal Situation
    hasRelationship: {
      type: Boolean,
      required: true,
    },
    hasOrganization: {
      type: Boolean,
      required: true,
    },
    hasScholarship: {
      type: Boolean,
      required: true,
    },
    hasJob: {
      type: Boolean,
      required: true,
    },

    // Lifestyle
    monthlyAllowance: {
      type: Number,
      required: true,
      min: 0,
    },
    studyHours: {
      type: Number,
      required: true,
      min: 0,
    },
    preferredPaymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    healthConcern: {
      type: String,
      required: true,
      trim: true,
    },
    frequencyGoingHome: {
      type: String,
      required: true,
      trim: true,
    },

    // Living Situation
    housingType: {
      type: String,
      required: true,
      trim: true,
    },
    transportation: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Feature', FeatureSchema);
