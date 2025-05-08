import {User} from "../models/User.models.js";
import {Transaction} from "../models/transactions.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import chalk from "chalk";

import {apiError} from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {apiResponse} from "../utils/apiResponse.js";
import { log } from "console";

// Get all transactions for the logged-in user, with optional type filter
export const getTransactions = async (req, res, next) => {
    try {
        const query = { user: req.user.id };
        if (req.query.type) {
            query.type = req.query.type;
        }
        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.status(200).json(new apiResponse(200, transactions, "Transactions fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Get a single transaction by ID
export const getTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id })
            .populate('category', 'name')
        if (!transaction) {
            return next(new apiError(404, "Transaction not found"));
        }
        res.status(200).json(new apiResponse(200, transaction, "Transaction fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Create a new transaction
export const createTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction.create({
            ...req.body,
            user: req.user.id // Always use authenticated user's id
        });
        res.status(201).json(new apiResponse(201, transaction, "Transaction created successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Update a transaction
export const updateTransaction = async (req, res, next) => {
    try {
        let transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
        if (!transaction) {
            return next(new apiError(404, "Transaction not found"));
        }
        // Prevent changing the user field
        const updateData = { ...req.body };
        delete updateData.user;
        transaction = await Transaction.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
        res.status(200).json(new apiResponse(200, transaction, "Transaction updated successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Delete a transaction
export const deleteTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
        if (!transaction) {
            return next(new apiError(404, "Transaction not found"));
        }
        await transaction.deleteOne();
        res.status(200).json(new apiResponse(200, {}, "Transaction deleted successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Get transactions by category
export const getTransactionsByCategory = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({
            user: req.user.id,
            category: req.params.categoryId
        }).sort({ date: -1 });
        res.status(200).json(new apiResponse(200, transactions, "Transactions by category fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Get transactions by date range: /daterange?start=YYYY-MM-DD&end=YYYY-MM-DD
export const getTransactionsByDateRange = async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const query = {
            user: req.user.id,
            date: {}
        };
        if (start) query.date.$gte = new Date(start);
        if (end) query.date.$lte = new Date(end);
        if (!start && !end) delete query.date;
        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.status(200).json(new apiResponse(200, transactions, "Transactions by date range fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};

// Get transaction stats (example: total income/expense)
export const getTransactionStats = async (req, res, next) => {
    try {
        const stats = await Transaction.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json(new apiResponse(200, stats, "Transaction stats fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message));
    }
};