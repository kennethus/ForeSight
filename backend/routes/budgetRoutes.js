const express = require('express')
const {
  createBudget,
  getBudget,
  getBudgetsByUser,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController')
const { authenticate } = require('../middlewares/authMiddleware')

const router = express.Router()

// GET all transactions
router.get('/', authenticate, getBudgetsByUser)

//GET a single transaction
router.get('/:id', authenticate, getBudget)

// POST a new transaction
router.post('/', authenticate, createBudget);

//DELETE a transaction
router.delete('/:id', authenticate, deleteBudget)

//UPDATE a new transaction
router.patch('/:id', authenticate, updateBudget)

//export all router
module.exports = router