import {Transaction} from "../models/transactions.models.js";
import {Budget} from "../models/budget.model.js";
import {Goal} from "../models/goals.models.js";
import {User} from "../models/User.models.js";
import {apiResponse} from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { log } from "console";




import { apiError } from "../utils/apiError.js";

// @desc    Get dashboard summary
// @route   GET /api/v1/dashboard/summary
// @access  Private
export const getDashboardSummary = async (req, res, next) => {
  try {
    // Get the current month's range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get total income for the month
    const incomeResult = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'income',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get total expenses for the month
    const expenseResult = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get total savings for the month
    const savingsResult = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'savings',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      user: req.user._id
    })
      .sort({ date: -1 })
      .limit(10)
      .populate('category', 'name');

    // Get active budgets
    const activeBudgets = await Budget.find({
      user: req.user._id,
      startDate: { $lte: now },
      $or: [{ endDate: { $gte: now } }, { endDate: null }]
    }).populate('categories', 'name');

    // Get active goals
    const activeGoals = await Goal.find({
      user: req.user._id,
      status: { $in: ['not started', 'in progress'] }
    });

    res.status(200).json({
      success: true,
      data: {
        monthlyIncome: incomeResult.length > 0 ? incomeResult[0].total : 0,
        monthlyExpenses: expenseResult.length > 0 ? expenseResult[0].total : 0,
        monthlySavings: savingsResult.length > 0 ? savingsResult[0].total : 0,
        balance:
          (incomeResult.length > 0 ? incomeResult[0].total : 0) -
          (expenseResult.length > 0 ? expenseResult[0].total : 0),
        recentTransactions,
        activeBudgets,
        activeGoals
      }
    });
  } catch (error) {
    next(new apiError(500, error.message));
  }
};