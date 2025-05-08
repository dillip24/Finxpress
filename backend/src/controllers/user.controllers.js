
import {User} from "../models/User.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import chalk from "chalk";

import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import {apiError} from "../utils/apiError.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
import {apiResponse} from "../utils/apiResponse.js";
import { log } from "console";




export const changePassword = async (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return next(new apiError(400, "Old password and new password are required"));
      }
  
      const user = await User.findById(req.user._id).select("+password");
      if (!user) {
        return next(new apiError(404, "User not found"));
      }
  
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return next(new apiError(401, "Old password is incorrect"));
      }
  
      user.password = newPassword;
      await user.save();
  
      res.json(new apiResponse(200, null, "Password updated successfully"));
    } catch (error) {
      next(new apiError(500, error.message));
    }
  };

export const logoutUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new apiError(404, "User not found");
        }
        user.refreshToken = null;
        await user.save();
        res.clearCookie("accessToken", { httpOnly: true });
        res.clearCookie("refreshToken", { httpOnly: true });
        return res.status(200).json(new apiResponse(200, null, "User logged out successfully"));
    } catch (error) {
        console.error("Error logging out user: ", error);
        throw new apiError(500, "Error logging out user");
    }
}
const generateAccessAndrefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new apiError(404, "User not found");
        }
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();
        return {accessToken, refreshToken};
    } catch (error) {
        console.log("Error generating tokens", error);
        throw new apiError(500, "Failed to generate tokens");
    }
};


export const getCurrentUser = async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    // Remove sensitive fields like password
    const { password, ...userData } = req.user.toObject();
    res.status(200).json({
      success: true,
      user: userData
    });
  };


export const registerUser = async (req, res) => {
    const { username, email, firstName, lastName, password, phonenumber } = req.body;

    if (
        [firstName, lastName, email, username, password, phonenumber].some(
            (field) => field?.trim() === undefined || field === ""
        )
    ) {
        throw new apiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (existedUser) {
        throw new apiError(409, "User with email or username already exists");
    }

    const ppLocalPath = req.files?.profilepicture?.[0]?.path;
    if(!ppLocalPath) {
        throw new apiError(400, "Profile picture is required");
    }

    let profile;
    try {
        profile = await uploadOnCloudinary(ppLocalPath);
        console.log("Profile picture uploaded to cloudinary: ", profile.url);
    }
    catch (error) {
        throw new apiError(500, "Error uploading profile picture to cloudinary");
    }

    try {
        const user = await User.create({
            username: username.toLowerCase(),
            email,
            firstName,
            lastName,
            profilepicture: profile?.url,
            phonenumber,
            password,
        });

        const createdUser = await User.findById(user._id).select("-password");
        if(!createdUser) {
            throw new apiError(500, "Error creating user");
        }
        return res.status(201).json(new apiResponse(201, createdUser, "User created successfully"));

    }
    catch (error) {
        console.error("Error creating user: ", error);
        if(profile) {
            await deleteFromCloudinary(profile.public_id);
        }
        throw new apiError(500, "Error creating user");
    }
};

export const loginUser = async (req, res) => {
    log(chalk.red("Login request body: " + JSON.stringify(req.body)));

    const { username, password } = req.body;
    if (!username || !password) {
        throw new apiError(400, "Username and password are required");
    }

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
        throw new apiError(401, "Invalid username or password");
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        throw new apiError(401, "Invalid username or password");
    }
    const {accessToken, refreshToken} = await generateAccessAndrefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true, // Cookie cannot be accessed by JavaScript on the client (helps prevent XSS attacks)
        secure: process.env.NODE_ENV === "production", // Cookie is only sent over HTTPS in production
        sameSite: "strict", // Cookie is not sent with cross-site requests (helps prevent CSRF attacks)
        maxAge: 1000 * 60 * 60 * 24, // Cookie expires after 1 day (in milliseconds)
    };

    console.log(chalk.green("Login was sucessfull"));
    
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(
                200,
                {user: loggedInUser, accessToken, refreshToken},
                "User logged in successfully"
        ));
};

export const ShowAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password -refreshToken");
        res.status(200).json(users);
    } catch (error) {
        throw new apiError(
            500,
            "Error fetching users"
        );
    }
};


export const updateMe = async (req, res, next) => {
  try {
    const allowedFields = [
      "firstName", "lastName", "email", "phonenumber", "bio",
      "country", "city", "postalCode", "taxId",
      "language", "currency", "dateFormat", "timezone"
    ];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Handle profile picture upload
    if (req.files && req.files.profilepicture && req.files.profilepicture[0]) {
      const localPath = req.files.profilepicture[0].path;
      const uploaded = await uploadOnCloudinary(localPath);
      if (uploaded && uploaded.url) {
        // Delete old profile picture if not default
        const user = await User.findById(req.user._id);
        if (
          user.profilepicture &&
          !user.profilepicture.includes("default-profile-picture.png")
        ) {
          // Optionally extract public_id and delete from Cloudinary
          // await deleteFromCloudinary(oldPublicId);
        }
        updates.profilepicture = uploaded.url;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return next(new apiError(404, "User not found"));
    }

    res.json(new apiResponse(200, user, "Profile updated successfully"));
  } catch (error) {
    next(new apiError(500, error.message));
  }
};