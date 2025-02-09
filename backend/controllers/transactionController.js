const Transaction = require('../models/TransactionModel');
const TransactionBudget = require('../models/TransactionBudgetModel')
const Budget = require('../models/BudgetModel')
const mongoose = require('mongoose');

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
        const { userId } = req.body
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid User ID" });
        }

        const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single transaction
const getTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({success: false, message: "Invalid transaction ID" });
        }    

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({success: false, message: "Transaction not found" });
        }
        res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching transaction', error: error.message });
    }
};

const createTransaction = async (req, res) => {
    try {
        const { userId, name, totalAmount, category, type, description, date, budgetAllocations } = req.body;
        /**
         * `budgetAllocations` is an array of objects:
         * Example:
         * budgetAllocations = [
         *   { budgetId: "budget1_id", amount: 30 },
         *   { budgetId: "budget2_id", amount: 70 }
         * ];
         */

        if (!userId || !name || !category || !type || !date || !budgetAllocations || budgetAllocations.length === 0) {
            return res.status(400).json({ success: false, message: "Required fields are missing" });
        }
        
        if (totalAmount <= 0){
            return res.status(400).json({ success: false, message: "Invalid total amount" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid User ID" });
        }

    
        //Create a new transaction
        const newTransaction = new Transaction({
            userId,
            name,
            totalAmount,
            category,
            type,
            description,
            date
        });

        const savedTransaction = await newTransaction.save();

        //Link transaction with budgets
        const transactionBudgetEntries = budgetAllocations.map(({ budgetId, amount }) => ({
            transactionId: savedTransaction._id,
            budgetId,
            amount
        }));

        await TransactionBudget.insertMany(transactionBudgetEntries);

        // Update each budget's spent amount
        for (const { budgetId, amount } of budgetAllocations) {
            if (type == 'Expense'){
                await Budget.findByIdAndUpdate(budgetId, { $inc: { spent: amount } });
            } else {
                await Budget.findByIdAndUpdate(budgetId, { $inc: { earned: amount } });
            }
        }

        res.status(201).json({ success: true, message: 'Transaction created successfully', data: savedGoal });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating transaction', error: error.message });
    }
};


// Delete transaction
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid transaction ID" });
        }

        const transaction = await Transaction.findByIdAndDelete(id);
        if (!transaction) {
            return res.status(404).json({  success: false, message: "Transaction not found" });
        }
        res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting transaction', error: error.message });
    }
};

// Update transaction
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Transaction ID" });
        }
    
        const updatedTransaction = await Transaction.findByIdAndUpdate({_id: id}, {
            ...req.body
        }, { new: true, runValidators: true });
        if (!updatedTransaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }
        res.status(200).json({ success: true, message: 'Transaction updated successfully', data: goal });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating transaction', error: error.message });
    }
};

module.exports = {
    getTransaction,
    getTransactions,
    getTransactionsByUser,
    createTransaction,
    deleteTransaction,
    updateTransaction
};
