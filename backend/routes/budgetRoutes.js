const express = require('express')
const {
  createBudget,
  getBudget,
  getBudgetsByUser,
  updateBudget,
  closeBudget,
  getOpenBudgets,
  deleteBudget,
  getBudgetByName,
  updateBudgetAmountById
} = require('../controllers/budgetController')
const { authenticate } = require('../middlewares/authMiddleware')

const router = express.Router()

// GET all transactions
router.get('/', authenticate, getBudgetsByUser)

// POST a new transaction
router.post('/', authenticate, createBudget);

//GET open Budgets by User
router.get('/openBudgets', authenticate, getOpenBudgets)

router.get('/getByName/:name', authenticate, getBudgetByName)

router.patch('/updateAmount/:id', authenticate, updateBudgetAmountById)

//CLOSE a budget
router.patch('/close/:id', authenticate, closeBudget)

//GET a single transaction
router.get('/:id', authenticate, getBudget)

//UPDATE a new transaction
router.patch('/:id', authenticate, updateBudget)

router.delete('/:id', authenticate, deleteBudget)


//export all router
module.exports = router