const express = require('express');
const router = express.Router();
const {
    createGoal,
    getGoalsByUser,
    getGoal,
    updateGoal,
    deleteGoal
} = require('../controllers/goalController');
const { authenticate } = require('../middlewares/authMiddleware')


// Create a new goal
router.post('/', authenticate, createGoal);

// Get all goals for a specific user
router.get('/', authenticate, getGoalsByUser);

// Get a single goal by ID
router.get('/:id', authenticate, getGoal);

// Update a goal
router.patch('/:id', authenticate, updateGoal);

// Delete a goal
router.delete('/:id', authenticate, deleteGoal);

module.exports = router;
