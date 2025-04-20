const express = require("express");
const {
  createTransaction,
  getTransactionsByUser,
  getTransaction,
  deleteTransaction,
  updateTransaction,
  getPreviousTransactionsByUser,
  createMultipleTransactions,
  getExpenseTransactionsByUser,
  getMonthlyBreakdown,
  getMonthlyExpenses,
} = require("../controllers/transactionController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

// GET all transactions by User
router.get("/", authenticate, getTransactionsByUser);

router.get("/previous", authenticate, getPreviousTransactionsByUser);

router.get("/expense", authenticate, getExpenseTransactionsByUser);

router.get("/breakdown", authenticate, getMonthlyBreakdown);

router.get("/monthlyExpenses", authenticate, getMonthlyExpenses);

//GET a single transaction
router.get("/:id", authenticate, getTransaction);

// POST a new transaction
router.post("/", authenticate, createTransaction);

router.post("/multiple", authenticate, createMultipleTransactions);

//DELETE a transaction
router.delete("/:id", authenticate, deleteTransaction);

//UPDATE a new transaction
router.patch("/:id", authenticate, updateTransaction);

//export all router
module.exports = router;
