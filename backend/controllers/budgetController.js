const Budget = require('../models/BudgetModel');
const mongoose = require('mongoose');

// Get all budgets for a specific user
const getBudgetsByUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const budgets = await Budget.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching budget', error: error.message });
    }
};

// Get a single budget by ID
const getBudget = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Invalid budget ID"});
        }

        const budget = await Budget.findById(id);
        if (!budget) {
            return res.status(404).json({ success: false, message: 'Budget not found' });
        }
        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching budget', error: error.message });
    }
};

// Create a new budget
/**
    {
        userId,
        name,
        amount,
        spent,
        startDate,
        endDate,
        closed
    }
*/

const createBudget = async (req, res) => {
    try {
        const { userId, name, amount, spent, startDate, endDate, closed } = req.body;
        if (!userId || !name || !amount || spent<0 || !startDate || !endDate || (closed == null)) {
            return res.status(400).json({ success: false, message: "Required fields are missing"});
        }
    
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ success: false, message: "Invalid User ID"});
        }
    
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ success: false, message: "Start date cannot be after end date"});
        }

        const newBudget = new Budget({
            userId,
            name,
            amount,
            spent,
            startDate,
            endDate,
            closed
        });

        const savedBudget = await newBudget.save();
        res.status(201).json({ success: true, message: 'Budget created successfully', data: savedBudget });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating budget', error: error.message });
    }
};

// Update an existing budget
const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Invalid budget ID" });
        }
    
        if (req.body.startDate && req.body.endDate) {
            if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
                return res.status(400).json({ success: false, message: "Start date cannot be after end date" });
            }
        }
    
        const updatedBudget = await Budget.findByIdAndUpdate({_id: id}, {
            ...req.body
        }, { 
            new: true, 
            runValidators: true 
        });

        if (!updatedBudget) {
            return res.status(404).json({ success: false, error: "Budget not found" });
        }

        res.status(200).json({ success: true, message: 'Budget updated successfully', data: goal });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating budget', error: error.message });
    }
};

// Delete a budget
const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Invalid budget ID" });
        }        

        //Set closed to true
        const budget = await Budget.findByIdAndUpdate({_id: id}, {closed: true})
        if (!budget) {
            return res.status(404).json({  success: false, error: "Budget not found" });
        }

        res.status(200).json({ success: true, message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting budget', error: error.message });
    }
};

module.exports = {
    getBudgetsByUser,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget
};
