import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        unique: true,
        lowercase: true,
        trim: true,
        indexing: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email",
        ],
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        maxlength: 50,
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        maxlength: 50,
    },
    phonenumber: {
        type: String,
        required: [true, "Phone Number is required"],
        trim: true,
    },
    profilepicture: {
        type: String,
        default: "https://example.com/default-profile-picture.png",
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
        select: false,
    },
    bio: {
        type: String,
        default: "",
        maxlength: 200
    },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    taxId: { type: String, default: "" },
    language: { type: String, default: "English" },
    currency: { type: String, default: "USD" },
    dateFormat: { type: String, default: "D/M/Y" },
    timezone: { type: String, default: "UTC+0" },
    refreshToken: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
});

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    // short lived access token
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    // long lived refresh token
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
