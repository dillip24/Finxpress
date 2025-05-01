import mongoose,{Schema} from "mongoose";

const transactionsSchema = new Schema ({
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    Date: {
        type: Date,
        default: Date.now,
    },
    note : {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

});

export const Transactions = mongoose.model("Transactions", transactionsSchema);