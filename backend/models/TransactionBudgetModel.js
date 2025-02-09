const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransactionBudgetSchema = new Schema({
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  budgetId : {
    type: Schema.Types.ObjectId,
    ref: 'Budget',
    required: true
  },
  amount : {
    type: Number,
    required: true
  }
  
}, {
  timestamps: true
});

module.exports = mongoose.model('TransactionBudget', TransactionBudgetSchema);
