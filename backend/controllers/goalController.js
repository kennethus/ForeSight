const Goal = require('../models/GoalModel');
const mongoose = require('mongoose');


// Create a new goal
const createGoal = async (req, res) => {
  try {
    const { userId, name, targetAmount, currentAmount, endDate, completed } = req.body;
    if (!userId || !name || !targetAmount || currentAmount<0 || !endDate) {
        return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid User ID" });
    }

    if (new Date() > new Date(endDate)) {
        return res.status(400).json({ success: false, message: "End date should be after goal creation" });
    }

    // Create and save the goal
    const goal = new Goal({ 
        userId, 
        name, 
        targetAmount, 
        currentAmount, 
        endDate,
        completed
    });
    const savedGoal = await goal.save();

    res.status(201).json({ success: true, message: 'Goal created successfully', data: savedGoal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating goal', error: error.message });
  }
};

// Get all goals for a specific user
const getGoalsByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid User ID" });
    }

    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching goals', error: error.message });
  }
};

// Get a single goal by ID
const getGoal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Goal ID" });
    }

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching goal', error: error.message });
  }
};

// Update a goal
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid goal ID" });
    }

    const goal = await Goal.findByIdAndUpdate({_id: id}, {
        ...req.body
    }, { 
        new: true, 
        runValidators: true 
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.status(200).json({ success: true, message: 'Goal updated successfully', data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating goal', error: error.message });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid goal ID" });
    }       

    const deletedGoal = await Goal.findByIdAndDelete(id);
    if (!deletedGoal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.status(200).json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting goal', error: error.message });
  }
};

// Update a goal amount
const updateGoalAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentAmount } = req.body; // Only allow updating currentAmount

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid goal ID" });
    }

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    // Ensure currentAmount is not higher than the target amount
    const updatedAmount = goal.currentAmount + parseFloat(currentAmount);

    // Update goal
    goal.currentAmount = updatedAmount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.completed = true; // Mark goal as completed if target is met
    }
    
    await goal.save();

    res.status(200).json({ success: true, message: 'Goal updated successfully', data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating goal', error: error.message });
  }
};


module.exports = {
  createGoal,
  getGoalsByUser,
  getGoal,
  updateGoal,
  deleteGoal,
  updateGoalAmount
};
