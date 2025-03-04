const TransactionBudget = require('../models/TransactionBudgetModel');
const mongoose = require('mongoose');


const getTransactionBudgets = async (req, res) => {
  try {
    const { transactionId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        return res.status(400).json({ success: false, message: "Invalid Transaction ID" });
    }
    
    // Find all TransactionBudget entries linked to the transactionId
    const transactionBudgets = await TransactionBudget.find({ transactionId })
      .populate('budgetId'); // Populating budget details

      console.log('Sending TransactionBudget: ', transactionBudgets)
      res.status(200).json({ success: true, data: transactionBudgets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getTransactionBudgets
}