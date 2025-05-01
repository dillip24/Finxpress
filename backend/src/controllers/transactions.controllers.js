import {Transaction} from "../models/Transactions.models.js,";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import chalk from "chalk";


import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";


import {apiError} from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {apiResponse} from "../utils/apiResponse.js";
import { log } from "console";





export const addTransaction = async (req, res) => {
    const { amount, type,Date,note,user} = req.body;




    try {
        const transaction = await  Transaction.create({
            amount,
            type,
            Date,
            note
        } );
    
        const createdEvent = await Transaction.findById(transaction._id)
                if(!createdEvent) {
                    throw new apiError(500, "Error creating the event ")
                }
                return res.status(201).json(new apiResponse(201, createdTransaction, "event created successfully"));
    
        }
        catch (error) {
            console.error("Error creating event: ", error);
            
            throw new apiError(500, "Error creating event")
        }
    
}


export default addTransaction;

