import mongoose  from "mongoose";
import { apiError } from "../utils/apiError.js";



const errorHandler = (err, res) => {
    let error = err;

    if (!(error instanceof apiError)) {
        const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
        const message = error.message || "Something went wrong";
        error = new apiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        statusCode: error.statusCode,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };

    return res.status(error.statusCode || 500).json(response);
}


export {errorHandler}