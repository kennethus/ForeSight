const express = require('express')
const {
  createBudget,
  getBudget,
  getBudgetsByUser,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController')
const router = express.Router()

// GET all transactions
router.get('/', getBudgetsByUser)

//GET a single transaction
router.get('/:id', getBudget)

// POST a new transaction
router.post('/', createBudget);

//DELETE a transaction
router.delete('/:id', deleteBudget)

//UPDATE a new transaction
router.patch('/:id', updateBudget)

//export all router
module.exports = router