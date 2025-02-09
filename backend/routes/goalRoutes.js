const express = require('express');
const router = express.Router();
const {
    createGoal,
    getGoalsByUser,
    getGoal,
    updateGoal,
    deleteGoal
} = require('../controllers/goalController');

// Create a new goal
router.post('/', createGoal);

// Get all goals for a specific user
router.get('/', getGoalsByUser);

// Get a single goal by ID
router.get('/:id', getGoal);

// Update a goal
router.patch('/:id', updateGoal);

// Delete a goal
router.delete('/:id', deleteGoal);

module.exports = router;
