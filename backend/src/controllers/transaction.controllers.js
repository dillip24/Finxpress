import {User} from "../models/User.models.js";
import {Transactions} from "../models/Transactions.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import chalk from "chalk";

import {apiError} from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {apiResponse} from "../utils/apiResponse.js";
import { log } from "console";





export const createTransaction = async (req, res) => {

    console.log("req.body", req.body);
    const {  amount, type , note, user} = req.body;

    if (!user || !amount || !type ) {
        throw new apiError(400, "All fields are required");
    }

    const transaction = await Transactions.create({
        user,
        amount,
        type,
        note
    });

    return res.status(201).json(new apiResponse(201, transaction, "Transaction added successfully"));
}



export const getTransactions = async (req, res) => {
    const { user } = req.params;
    console.log("user", user);
    if (!user) {
        throw new apiError(400, "User id is required");
    }

    const transactions = await Transactions.find({ user }).sort({ createdAt: -1 });

    return res.status(200).json(new apiResponse(200, transactions, "Transactions fetched successfully"));
}
