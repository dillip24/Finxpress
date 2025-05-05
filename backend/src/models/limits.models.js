
import mongoose, { Schema } from "mongoose";




const limitsSchema =  new Schema({
    category: {
        type: String,
        required: true,
    },
    limit: {
        type: Number,
        required: true,
    },
    currentAmount: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    transactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transactions",
        },
    ],

});

export const Limits = mongoose.model("Limits", limitsSchema);