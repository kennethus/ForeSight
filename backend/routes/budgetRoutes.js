const express = require('express')
const {
  createBudget,
  getBudget,
  getBudgetsByUser,
  updateBudget,
  closeBudget,
  getOpenBudgets
} = require('../controllers/budgetController')
const { authenticate } = require('../middlewares/authMiddleware')

const router = express.Router()

// GET all transactions
router.get('/', authenticate, getBudgetsByUser)

// POST a new transaction
router.post('/', authenticate, createBudget);

//GET open Budgets by User
router.get('/openBudgets', authenticate, getOpenBudgets)

//DELETE a transaction
router.patch('/close/:id', authenticate, closeBudget)

//GET a single transaction
router.get('/:id', authenticate, getBudget)

//UPDATE a new transaction
router.patch('/:id', authenticate, updateBudget)


//export all router
module.exports = router