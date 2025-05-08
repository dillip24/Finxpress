import { Schema, model } from 'mongoose';

const GoalSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required']
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['not started', 'in progress', 'completed', 'abandoned'],
    default: 'not started'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  linkedTransactions: [{
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
}, { timestamps: true });

// Create index for efficient querying
GoalSchema.index({ user: 1, status: 1 });

export  const Goal = model('Goal', GoalSchema);
// This model represents a financial goal, allowing users to set and track their savings or investment objectives. The schema includes fields for the goal's title, description, target amount, current amount, start date, target date, priority level, status, and linked transactions. The model also includes an index for efficient querying based on user ID and goal status.
