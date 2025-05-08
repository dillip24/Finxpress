import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 50,
      unique: false, // uniqueness handled by compound index below
    },
    type: {
      type: String,
      enum: ["expense", "income", "savings"],
      required: [true, "Category type is required"],
    },
    color: {
      type: String,
      default: "#000000", // Default color for visualization
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique category names per user
CategorySchema.index({ name: 1, user: 1 }, { unique: true });

export const Category = mongoose.model("Category", CategorySchema);