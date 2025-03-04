const express = require('express')
const {
  getTransactionBudgets
} = require('../controllers/transactionBudgetController')
const { authenticate } = require('../middlewares/authMiddleware')

const router = express.Router()

// GET all budgets by transaction
router.get('/', authenticate, getTransactionBudgets)

//export all router
module.exports = router