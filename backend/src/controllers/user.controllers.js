import {User} from "../models/User.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import chalk from "chalk";


import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";


import {apiError} from "../utils/apiError.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
import {apiResponse} from "../utils/apiResponse.js";
import { log } from "console";


const generateAccessAndrefreshToken = async (userId) => {
    try {
        const user = await User
            .findById(userId)
        
        if(!user){
            throw new apiError(404, "User not found")
    
        }
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
    
        User.refreshToken = refreshToken
        await user.save()
        return {accessToken, refreshToken}
    } catch (error) {
        console.log("Error generating tokens", error);
        throw new apiError(500, "Failed to generate tokens")
    }
}


export const registerUser = async (req, res) => {
    const { username, email, fullname , password,phonenumber } = req.body;



    if (
        [fullname, email, username, password, phonenumber].some((field) => field?.trim() === undefined || field === "")
    ) {
        throw new apiError(400, "All fields are required")
    }


    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new apiError(409, "User with email or username already exists")
    }


    const ppLocalPath = req.files?.profilepicture?.[0]?.path;
    if(!ppLocalPath) {
        throw new apiError(400, "Profile picture is required")
    }

    let profile ;
    try 
    {
        profile = await uploadOnCloudinary(ppLocalPath);
        console.log("Profile picture uploaded to cloudinary: ", profile.url);
        
    }
    catch (error) {
        throw new apiError(500, "Error uploading profile picture to cloudinary")
    }


    try {
        const user = await User.create({
            username : username.toLowerCase(),
            email,
            fullname,
            profilepicture: profile?.url,
            phonenumber,
            password,
        });
        
        const createdUser = await User.findById(user._id).select("-password ");
        if(!createdUser) {
            throw new apiError(500, "Error creating user")
        }
        return res.status(201).json(new apiResponse(201, createdUser, "User created successfully"));

    }
    catch (error) {
        console.error("Error creating user: ", error);
        if(profile)
        {
            await deleteFromCloudinary(profile.public_id);
        }
        throw new apiError(500, "Error creating user")
    }
}


export const loginUser = async (req, res) => {
    log(chalk.red("Login request body: " + JSON.stringify(req.body)));

    const { username, password } = req.body;
    if (!username || !password) {
        throw new apiError(400, "Email and password are required")
    }

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
        throw new apiError(401, "Invalid email or password")
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new apiError(401, "Invalid email or password")
    }
    const {accessToken, refreshToken} = await generateAccessAndrefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(
                200,
                {user: loggedInUser, accessToken, refreshToken},
                "User logged in successfully"
        ))

}


    

export const ShowAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        new apiError(
            "Error fetching users",
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
}