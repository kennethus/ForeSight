const Feature = require("../models/FeatureModel");
const mongoose = require("mongoose");

const createFeatures = async (req, res) => {
  try {
    console.log(req.body);

    const {
      userId,
      yearLevel,
      personality,
      inRelationship,
      homeRegion,
      livingSituation,
      dormArea,
      numberOfRoommates,
      degreeProgram,
      haveOrganization,
      studyHoursPerWeek,
      monthlyAllowance,
      familyMonthlyIncome,
      hasScholarship,
      hasJobOrBusiness,
      mealPreferences,
      frequencyGoingHomePerSemester,
      preferredPaymentMethod,
      hasHealthConcerns,
      healthConcernDetails,
      hasTrackExpensesBefore,
    } = req.body;

    // Convert expected numbers from strings to actual numbers
    const processedData = {
      userId,
      yearLevel,
      numberOfRoommates,
      studyHoursPerWeek,
      monthlyAllowance: Number(monthlyAllowance),
      familyMonthlyIncome,
      hasTrackExpensesBefore,
      personality,
      inRelationship,
      homeRegion,
      livingSituation,
      dormArea,
      degreeProgram,
      haveOrganization,
      hasScholarship,
      hasJobOrBusiness,
      mealPreferences,
      frequencyGoingHomePerSemester,
      preferredPaymentMethod,
      hasHealthConcerns,
      healthConcernDetails,
    };

    console.log(processedData);
    // Validate required fields
    if (
      !processedData.userId ||
      processedData.yearLevel === "" ||
      typeof processedData.yearLevel === "undefined" ||
      processedData.personality === "" ||
      typeof processedData.personality === "undefined" ||
      typeof processedData.inRelationship === "undefined" ||
      processedData.homeRegion === "" ||
      typeof processedData.homeRegion === "undefined" ||
      processedData.livingSituation === "" ||
      typeof processedData.livingSituation === "undefined" ||
      processedData.dormArea === "" ||
      typeof processedData.dormArea === "undefined" ||
      processedData.numberOfRoommates === "" ||
      typeof processedData.numberOfRoommates === "undefined" ||
      processedData.degreeProgram === "" ||
      typeof processedData.degreeProgram === "undefined" ||
      typeof processedData.haveOrganization === "undefined" ||
      processedData.studyHoursPerWeek === "" ||
      typeof processedData.studyHoursPerWeek === "undefined" ||
      processedData.monthlyAllowance < 0 ||
      typeof processedData.monthlyAllowance === "undefined" ||
      processedData.familyMonthlyIncome === "" ||
      typeof processedData.familyMonthlyIncome === "undefined" ||
      typeof processedData.hasScholarship === "undefined" ||
      typeof processedData.hasJobOrBusiness === "undefined" ||
      processedData.mealPreferences === "" ||
      typeof processedData.mealPreferences === "undefined" ||
      processedData.frequencyGoingHomePerSemester === "" ||
      typeof processedData.frequencyGoingHomePerSemester === "undefined" ||
      processedData.preferredPaymentMethod === "" ||
      typeof processedData.preferredPaymentMethod === "undefined" ||
      typeof processedData.hasHealthConcerns === "undefined" ||
      typeof processedData.hasTrackExpensesBefore === "undefined"
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing or invalid",
      });
    }

    // Validate if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(processedData.userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    // Create and save the feature
    const newFeature = new Feature(processedData);
    const savedFeature = await newFeature.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: "Feature created successfully",
      data: savedFeature,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating feature",
      error: error.message,
    });
  }
};

const getFeatureByUser = async (req, res) => {
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

    const feature = await Feature.findOne({ userId }); // Find the feature for the user

    res.status(200).json({ success: true, data: feature });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching feature",
      error: error.message,
    });
  }
};

const updateFeature = async (req, res) => {
  try {
    const { id } = req.params; // Feature ID from URL

    // Validate feature ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid feature ID" });
    }

    // Find and update feature
    const updatedFeature = await Feature.findByIdAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    // Check if feature exists
    if (!updatedFeature) {
      return res
        .status(404)
        .json({ success: false, message: "Feature not found" });
    }

    res.status(200).json({
      success: true,
      message: "Feature updated successfully",
      data: updatedFeature,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating feature",
      error: error.message,
    });
  }
};

module.exports = { createFeatures, getFeatureByUser, updateFeature };
