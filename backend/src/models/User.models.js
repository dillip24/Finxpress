import mongoose,{Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



const userSchema = new Schema({
    username: {
        type: String,
        required: [true,"username is required"],
        unique: true,
        lowercase: true,
        trim: true,
        indexing: true
    },
    email : {
        type: String,
        required: [true,"email is required"],
        unique: true,
        lowercase: true,
        trim: true   
    },
    fullname: {
        type: String,
        required: [true,"Full Name is required"],
        trim: true,
        indexing: true
    },
    phonenumber: {
        type: String,
        required: [true,"Phone Number is required"],
        trim: true,
    },
    profilepicture: {
        type: String,
        default: "https://example.com/default-profile-picture.png",
    },
    password: {
        type: String,
        required: [true, "Password is required"],	
    },
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
}
);

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    //short lived access token
    return jwt.sign({
        id : this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY    }
    )
}

userSchema.methods.generateRefreshToken = function () {
    //long lived refresh token
    return jwt.sign({
        id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY    }
    )
}


export const User = mongoose.model("User", userSchema);
