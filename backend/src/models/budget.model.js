import mongoose, { Schema } from "mongoose";

const BudgetSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: 100
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required']
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notificationThreshold: {
    type: Number,
    default: 80, // Percentage of budget when alert should be triggered
    min: 0,
    max: 100
  }
}, { timestamps: true });

// Create indexes
BudgetSchema.index({ user: 1, period: 1 });

export const Budget = mongoose.model('Budget', BudgetSchema);