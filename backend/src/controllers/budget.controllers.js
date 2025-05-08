import { Budget } from "../models/budget.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Transaction } from "../models/transactions.models.js";
import mongoose from "mongoose";

// Get all budgets for the logged-in user
export const getBudgets = async (req, res, next) => {
    try {
        const budgets = await Budget.find({ user: req.user.id }).sort({ startDate: -1 });
        res.status(200).json(new apiResponse(200, budgets, "Budgets fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Get a single budget by ID
export const getBudget = async (req, res, next) => {
    try {
        const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
        if (!budget) {
            return next(new apiError(404, "Budget not found"));
        }
        res.status(200).json(new apiResponse(200, budget, "Budget fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Create a new budget
export const createBudget = async (req, res, next) => {
    try {
        const budget = await Budget.create({
            ...req.body,
            user: req.user.id // Always use authenticated user's id
        });
        res.status(201).json(new apiResponse(201, budget, "Budget created successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Update a budget
export const updateBudget = async (req, res, next) => {
    try {
        let budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
        if (!budget) {
            return next(new apiError(404, "Budget not found"));
        }
        // Prevent changing the user field
        const updateData = { ...req.body };
        delete updateData.user;
        budget = await Budget.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
        res.status(200).json(new apiResponse(200, budget, "Budget updated successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Delete a budget
export const deleteBudget = async (req, res, next) => {
    try {
        const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
        if (!budget) {
            return next(new apiError(404, "Budget not found"));
        }
        await budget.deleteOne();
        res.status(200).json(new apiResponse(200, {}, "Budget deleted successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};



export const getBudgetProgress = async (req, res, next) => {
  try {
    console.log("Get Budget Progress Request Params:", req.params);
    console.log("Get Budget Progress Request User ID:", req.user.id);

    // Ensure req.user.id is ObjectId
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(req.user.id);
      console.log("Parsed userId as ObjectId:", userId);
    } catch (e) {
      console.error("Failed to parse userId as ObjectId:", req.user.id, e);
      return next(new apiError(400, "Invalid user id"));
    }

    // Find the budget
    let budget;
    try {
      budget = await Budget.findOne({ _id: req.params.id, user: userId });
      console.log("Fetched budget:", budget);
    } catch (e) {
      console.error("Error fetching budget:", e);
      return next(new apiError(500, "Error fetching budget"));
    }
    if (!budget) {
      console.error("Budget not found for user:", userId);
      return next(new apiError(404, "Budget not found"));
    }

    // Prepare categories as ObjectIds
    let categories = [];
    try {
      categories = Array.isArray(budget.categories) && budget.categories.length > 0
        ? budget.categories.map(id => new mongoose.Types.ObjectId(id))
        : [];
      console.log("Categories as ObjectIds:", categories);
    } catch (e) {
      console.error("Error parsing categories as ObjectIds:", budget.categories, e);
      return next(new apiError(500, "Error parsing categories"));
    }

    // Build match object
    const match = {
      user: userId,
      date: { $gte: budget.startDate, $lte: budget.endDate },
      type: "expense"
    };
    if (categories.length > 0) {
      match.category = { $in: categories };
    }
    console.log("Aggregation match filter:", match);

    // Find matching transactions
    let txs;
    try {
      txs = await Transaction.find(match);
      console.log("Matching transactions:", txs);
    } catch (e) {
      console.error("Error finding transactions:", e);
      return next(new apiError(500, "Error finding transactions"));
    }

    // Aggregate spent amount
    let spentAgg;
    try {
      spentAgg = await Transaction.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      console.log("Spent Aggregation:", spentAgg);
    } catch (e) {
      console.error("Error in aggregation:", e);
      return next(new apiError(500, "Error in aggregation"));
    }

    const spent = spentAgg.length > 0 ? spentAgg[0].total : 0;
    const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;

    res.status(200).json(new apiResponse(200, { spent, percentage }, "Budget progress fetched successfully"));
  } catch (error) {
    console.error("Unknown error in getBudgetProgress:", error);
    next(new apiError(500, error.message));
  }
};