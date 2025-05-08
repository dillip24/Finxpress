import { Goal } from "../models/goals.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

// Get all goals for the logged-in user
export const getGoals = async (req, res, next) => {
    try {
        const goals = await Goal.find({ user: req.user.id }).sort({ targetDate: 1 });
        res.status(200).json(new apiResponse(200, goals, "Goals fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Get a single goal by ID
export const getGoal = async (req, res, next) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
        if (!goal) {
            return next(new apiError(404, "Goal not found"));
        }
        res.status(200).json(new apiResponse(200, goal, "Goal fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Create a new goal
export const createGoal = async (req, res, next) => {
    try {
        const goal = await Goal.create({
            ...req.body,
            user: req.user.id // Always use authenticated user's id
        });
        res.status(201).json(new apiResponse(201, goal, "Goal created successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Update a goal
export const updateGoal = async (req, res, next) => {
    try {
        let goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
        if (!goal) {
            return next(new apiError(404, "Goal not found"));
        }
        // Prevent changing the user field
        const updateData = { ...req.body };
        delete updateData.user;
        goal = await Goal.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
        res.status(200).json(new apiResponse(200, goal, "Goal updated successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Delete a goal
export const deleteGoal = async (req, res, next) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
        if (!goal) {
            return next(new apiError(404, "Goal not found"));
        }
        await goal.deleteOne();
        res.status(200).json(new apiResponse(200, {}, "Goal deleted successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Update goal progress (e.g., update currentAmount)
export const updateGoalProgress = async (req, res, next) => {
    try {
        let goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
        if (!goal) {
            return next(new apiError(404, "Goal not found"));
        }
        // Only allow updating currentAmount and status via this route
        const { currentAmount, status } = req.body;
        if (currentAmount !== undefined) goal.currentAmount = currentAmount;
        if (status) goal.status = status;
        await goal.save();
        res.status(200).json(new apiResponse(200, goal, "Goal progress updated successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Get goal progress (percentage towards target)
export const getGoalProgress = async (req, res, next) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
        if (!goal) {
            return next(new apiError(404, "Goal not found"));
        }
        const progress = {
            currentAmount: goal.currentAmount,
            targetAmount: goal.targetAmount,
            percentage: goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0,
            status: goal.status
        };
        res.status(200).json(new apiResponse(200, progress, "Goal progress fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};