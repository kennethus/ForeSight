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

const getTransactionsByUser = async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;

    console.log("User ID received:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    const skip = (page - 1) * limit;

    // Total count for pagination metadata
    const total = await Transaction.countDocuments({ userId });

    // Fetch paginated transactions
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        transactions,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching paginated transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};

const getExpenseTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    const transactions = await Transaction.find({
      userId,
      type: { $regex: /^expense$/i }, // Case-insensitive match for "expense"
    }).sort({ date: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMonthlyBreakdown = async (req, res) => {
  try {
    const userId = req.user._id; // 👈 Use authenticated user's ID
    const { month, year } = req.query;

    if (!month || !year) {
      return res
        .status(400)
        .json({ success: false, message: "Month and year are required" });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      userId,
      type: { $regex: /^expense$/i }, // only expenses
      date: { $gte: start, $lte: end },
    });

    const breakdown = transactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.totalAmount;
      return acc;
    }, {});

    res.json({ success: true, data: breakdown });
  } catch (error) {
    console.error("Error getting breakdown:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get spending breakdown",
      error: error.message,
    });
  }
};

const getThreeMonthsExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    // Convert the provided month and year to Date objects for querying
    const currentMonthStart = new Date(year, month - 1, 1);
    const currentMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    // Define the previous 2 months
    const prevMonthStart = new Date(currentMonthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(prevMonthStart);
    prevMonthEnd.setMonth(prevMonthEnd.getMonth() + 1, 0);
    prevMonthEnd.setHours(23, 59, 59, 999);

    const twoMonthsAgoStart = new Date(prevMonthStart);
    twoMonthsAgoStart.setMonth(twoMonthsAgoStart.getMonth() - 1);
    const twoMonthsAgoEnd = new Date(twoMonthsAgoStart);
    twoMonthsAgoEnd.setMonth(twoMonthsAgoEnd.getMonth() + 1, 0);
    twoMonthsAgoEnd.setHours(23, 59, 59, 999);

    // Fetch expenses for the 3 months
    const transactions = await Transaction.find({
      userId,
      type: { $regex: /^expense$/i },
      date: {
        $gte: twoMonthsAgoStart, // From two months ago
        $lte: currentMonthEnd, // Up to the current month's end
      },
    });

    // Group transactions by month
    const groupedByMonth = {
      currentMonth: [],
      prevMonth: [],
      twoMonthsAgo: [],
    };

    transactions.forEach((transaction) => {
      const transactionMonth = transaction.date.getMonth();
      const transactionYear = transaction.date.getFullYear();

      if (
        transactionYear === currentMonthStart.getFullYear() &&
        transactionMonth === currentMonthStart.getMonth()
      ) {
        groupedByMonth.currentMonth.push(transaction);
      } else if (
        transactionYear === prevMonthStart.getFullYear() &&
        transactionMonth === prevMonthStart.getMonth()
      ) {
        groupedByMonth.prevMonth.push(transaction);
      } else if (
        transactionYear === twoMonthsAgoStart.getFullYear() &&
        transactionMonth === twoMonthsAgoStart.getMonth()
      ) {
        groupedByMonth.twoMonthsAgo.push(transaction);
      }
    });

    console.log(groupedByMonth);

    res.json({ success: true, data: groupedByMonth });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch three months' expenses",
      error: error.message,
    });
  }
};

const getMonthlyExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      userId,
      type: { $regex: /^expense$/i },
      date: { $gte: start, $lte: end },
    });

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly expenses",
      error: error.message,
    });
  }
};

const getPreviousTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    // Get the most recent transaction
    const latestTransaction = await Transaction.findOne({ userId }).sort({
      date: -1,
    });

    if (!latestTransaction) {
      return res.status(200).json({ success: true, data: [] });
    }

    const latestDate = new Date(latestTransaction.date);

    // Get the start of the month of the latest transaction
    const endDate = new Date(
      latestDate.getFullYear(),
      latestDate.getMonth(),
      1
    );

    // Go back 3 full months
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 3);

    const transactions = await Transaction.find({
      userId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
      type: { $regex: /^expense$/i },
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
      budgetAllocations.length === 0
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

const createMultipleTransactions = async (req, res) => {
  try {
    console.log("Raw request body:", req.body);
    const { transactions } = req.body;
    console.log(transactions);
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No transactions provided" });
    }

    const invalid = transactions.find(
      (tx) =>
        !tx.userId ||
        !tx.name ||
        !tx.category ||
        !tx.type ||
        !tx.date ||
        isNaN(tx.totalAmount) ||
        !mongoose.Types.ObjectId.isValid(tx.userId)
    );

    if (invalid) {
      return res.status(400).json({
        success: false,
        message: "Some transactions have missing or invalid fields",
      });
    }

    // Save all transactions
    const savedTransactions = await Transaction.insertMany(transactions);

    res.status(201).json({
      success: true,
      message: "Multiple transactions created successfully",
      data: savedTransactions,
    });
  } catch (error) {
    console.error("Bulk transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating multiple transactions",
      error: error.message,
    });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to delete transaction ID:", id);

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

    console.log(transactionBudgets);
    if (transactionBudgets.length) {
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
    }

    // Calculate balance adjustment
    const balanceAdjustment =
      transaction.type.toLowerCase() === "expense"
        ? transaction.totalAmount // Increase balance for expense
        : -transaction.totalAmount; // Decrease balance for income

    // Update user balance
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { balance: balanceAdjustment },
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
      { name, totalAmount, category, type, description, date },
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
  createMultipleTransactions,
  getExpenseTransactionsByUser,
  getMonthlyBreakdown,
  getMonthlyExpenses,
  getThreeMonthsExpenses,
};
