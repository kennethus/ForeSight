const Transaction = require("../models/TransactionModel");
const User = require("../models/UserModel");
const TransactionBudget = require("../models/TransactionBudgetModel");
const Budget = require("../models/BudgetModel");
const mongoose = require("mongoose");

// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all transactions by User
const getTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.query; // Use query parameters

    console.log("User ID received:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    const transactions = await Transaction.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPreviousTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    console.log("User ID received:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    // Calculate the date 3 months ago from today
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: threeMonthsAgo }, // Only transactions from the last 3 months
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single transaction
const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid transaction ID" });
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching transaction",
      error: error.message,
    });
  }
};

const createTransaction = async (req, res) => {
  try {
    const {
      userId,
      name,
      totalAmount,
      category,
      type,
      description,
      date,
      budgetAllocations,
      balance,
    } = req.body;
    /**
     * `budgetAllocations` is an array of objects:
     * Example:
     * budgetAllocations = [
     *   { budgetId: "budget1_id", amount: 30 },
     *   { budgetId: "budget2_id", amount: 70 }
     * ];
     */

    if (
      !userId ||
      !name ||
      !category ||
      !type ||
      !date ||
      !budgetAllocations ||
      budgetAllocations.length === 0 ||
      isNaN(balance)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields are missing" });
    }

    if (totalAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid total amount" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    //Create a new transaction
    const newTransaction = new Transaction({
      userId,
      name,
      totalAmount,
      category,
      type,
      description,
      date,
      balance,
    });

    const savedTransaction = await newTransaction.save();

    //Link transaction with budgets
    const transactionBudgetEntries = budgetAllocations.map(
      ({ budgetId, amount }) => ({
        transactionId: savedTransaction._id,
        budgetId,
        amount,
      })
    );

    await TransactionBudget.insertMany(transactionBudgetEntries);

    // Update each budget's spent amount
    for (const { budgetId, amount } of budgetAllocations) {
      if (type == "Expense") {
        await Budget.findByIdAndUpdate(budgetId, { $inc: { spent: amount } });
      } else {
        await Budget.findByIdAndUpdate(budgetId, { $inc: { earned: amount } });
      }
    }

    //update Balance if user
    if (type == "Expense") {
      await User.findByIdAndUpdate(userId, {
        $inc: { balance: totalAmount * -1 },
      });
    } else {
      await User.findByIdAndUpdate(userId, { $inc: { balance: totalAmount } });
    }

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: savedTransaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating transaction",
      error: error.message,
    });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid transaction ID" });
    }

    // Retrieve the transaction and associated budget allocations
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    const transactionBudgets = await TransactionBudget.find({
      transactionId: id,
    });

    if (!transactionBudgets.length) {
      return res.status(404).json({
        success: false,
        message: "No budgets linked to this transaction",
      });
    }

    // Determine whether to decrease 'spent' or 'earned' based on transaction type
    const updateField =
      transaction.type.toLowerCase() === "expense" ? "spent" : "earned";

    // Reverse the effect of the transaction on each affected budget
    for (const tb of transactionBudgets) {
      await Budget.findByIdAndUpdate(tb.budgetId, {
        $inc: { [updateField]: -tb.amount },
      });
    }

    // Delete the transaction-budget relations
    await TransactionBudget.deleteMany({ transactionId: id });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { balance: transaction.totalAmount },
    });

    // Delete the transaction itself
    await Transaction.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting transaction",
      error: error.message,
    });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      totalAmount,
      category,
      type,
      description,
      date,
      budgetAllocations,
      balance,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Transaction ID" });
    }

    // Retrieve the existing transaction and its allocations
    const existingTransaction = await Transaction.findById(id);
    if (!existingTransaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
    // Retrieve the user associated with this transaction
    const user = await User.findById(existingTransaction.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Calculate balance adjustment
    let balanceAdjustment = 0;
    if (existingTransaction.totalAmount !== totalAmount) {
      const amountDifference = totalAmount - existingTransaction.totalAmount;
      balanceAdjustment =
        existingTransaction.type.toLowerCase() === "expense"
          ? -amountDifference // Decrease balance for expense
          : amountDifference; // Increase balance for income

      // Update user balance
      await User.findByIdAndUpdate(user._id, {
        $inc: { balance: balanceAdjustment },
      });
    }

    const existingAllocations = await TransactionBudget.find({
      transactionId: id,
    });

    if (!existingAllocations.length) {
      return res.status(404).json({
        success: false,
        message: "No budgets linked to this transaction",
      });
    }

    // Determine the correct field to update (spent or earned)
    const updateField =
      existingTransaction.type.toLowerCase() === "expense" ? "spent" : "earned";

    // Revert the old transaction effect on each budget
    for (const alloc of existingAllocations) {
      await Budget.findByIdAndUpdate(alloc.budgetId, {
        $inc: { [updateField]: -alloc.amount },
      });
    }

    // Remove old allocations
    await TransactionBudget.deleteMany({ transactionId: id });

    // Update transaction details
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { name, totalAmount, category, type, description, date, balance },
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to update transaction" });
    }

    // Apply the new allocation to each budget
    const newUpdateField =
      updatedTransaction.type.toLowerCase() === "expense" ? "spent" : "earned";

    for (const alloc of budgetAllocations) {
      await Budget.findByIdAndUpdate(alloc.budgetId, {
        $inc: { [newUpdateField]: alloc.amount },
      });
      await new TransactionBudget({
        transactionId: id,
        budgetId: alloc.budgetId,
        amount: alloc.amount,
      }).save();
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating transaction",
      error: error.message,
    });
  }
};

module.exports = {
  getTransaction,
  getTransactions,
  getTransactionsByUser,
  createTransaction,
  deleteTransaction,
  updateTransaction,
  getPreviousTransactionsByUser,
};
