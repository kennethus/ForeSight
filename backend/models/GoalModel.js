const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },{
    timestamps: true, 
  });

module.exports = mongoose.model('Goal', GoalSchema);
