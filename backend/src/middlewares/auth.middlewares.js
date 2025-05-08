import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";
import { apiError } from "../utils/apiError.js";

export const authenticate = async (req, res, next) => {
    let token;

//     console.log("Authorization header:", req.headers.authorization);
// console.log("Cookies:", req.cookies);
    // Try to get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
        // Or from cookies
        token = req.cookies.accessToken;
    }

    if (!token) {
        return next(new apiError(401, "Not authorized, token missing"));
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return next(new apiError(401, "User not found"));
        }
        next();
    } catch (error) {
        return next(new apiError(401, "Not authorized, token failed"));
    }
};