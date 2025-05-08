import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Transaction title is required'],
    trim: true,
    maxlength: 100
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  type: {
    type: String,
    enum: ['expense', 'income', 'savings'],
    required: [true, 'Transaction type is required']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit card', 'debit card', 'bank transfer', 'other'],
    default: 'cash'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly'
    },
    endDate: {
      type: Date
    }
  },
  tags: [String]
}, { timestamps: true });

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);