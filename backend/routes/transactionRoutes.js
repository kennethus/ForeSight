const express = require("express");
const {
  createTransaction,
  getTransactionsByUser,
  getTransaction,
  deleteTransaction,
  updateTransaction,
  getPreviousTransactionsByUser,
} = require("../controllers/transactionController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

// GET all transactions by User
router.get("/", authenticate, getTransactionsByUser);

router.get("/previous", authenticate, getPreviousTransactionsByUser);

//GET a single transaction
router.get("/:id", authenticate, getTransaction);

// POST a new transaction
router.post("/", authenticate, createTransaction);

//DELETE a transaction
router.delete("/:id", authenticate, deleteTransaction);

//UPDATE a new transaction
router.patch("/:id", authenticate, updateTransaction);

//export all router
module.exports = router;
