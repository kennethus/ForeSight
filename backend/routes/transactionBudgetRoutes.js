const express = require('express')
const {
  getTransactionBudgets,
  getBudgetTransactions
} = require('../controllers/transactionBudgetController')
const { authenticate } = require('../middlewares/authMiddleware')

const router = express.Router()

// GET all budgets by transaction
router.get('/get-budgets', authenticate, getTransactionBudgets)

router.get('/get-transactions', authenticate, getBudgetTransactions)


//export all router
module.exports = router