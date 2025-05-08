import { Category } from "../models/category.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

// Create category
export const createCategory = async (req, res, next) => {
    console.log("Create Category Request Body:", req.body);
    try {
        // Always use authenticated user's id for the user field
        const { name, type, color } = req.body;
        if (name === undefined || name === "") {
            return next(new apiError(400, "Category name is required"));
        }
        const category = await Category.create({
            name,
            type,
            color,
            user: req.user.id, // <-- Use authenticated user
        });
        console.log("Category created:", category);
        return res.status(201).json(new apiResponse(201, category, "Category created successfully"));
    } catch (error) {
        console.error("Error creating category:", error);
        if (error.code === 11000) {
            // Duplicate key error (compound index)
            return next(new apiError(409, "Category with this name already exists for this user"));
        }
        next(new apiError(500, error.message));
    }
};

// Get all categories for the logged-in user
export const getCategories = async (req, res, next) => {
    // console.log("Get Categories for user:", req.user.id);
    try {
        const categories = await Category.find({ user: req.user.id }).sort({ createdAt: -1 });
        // console.log("Categories fetched:", categories.length);
        return res.status(200).json(new apiResponse(200, categories, "Categories fetched successfully"));
    } catch (error) {
        console.error("Error fetching categories:", error);
        next(new apiError(500, error.message));
    }
};

// Update category
export const updateCategory = async (req, res, next) => {
    console.log("Update Category Request Params:", req.params);
    console.log("Update Category Request Body:", req.body);
    try {
        let category = await Category.findById(req.params.id);
        if (!category) {
            console.warn(`Category not found with id ${req.params.id}`);
            return next(new apiError(404, `Category not found with id ${req.params.id}`));
        }
        if (category.user.toString() !== req.user.id) {
            console.warn("Not authorized to update this category");
            return next(new apiError(401, "Not authorized to update this category"));
        }
        // Prevent changing the user field
        const updateData = { ...req.body };
        delete updateData.user;
        category = await Category.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        console.log("Category updated:", category);
        return res.status(200).json(new apiResponse(200, category, "Category updated successfully"));
    } catch (error) {
        console.error("Error updating category:", error);
        if (error.code === 11000) {
            return next(new apiError(409, "Category with this name already exists for this user"));
        }
        next(new apiError(500, error.message));
    }
};

// Delete category
export const deleteCategory = async (req, res, next) => {
    console.log("Delete Category Request Params:", req.params);
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            console.warn(`Category not found with id ${req.params.id}`);
            return next(new apiError(404, `Category not found with id ${req.params.id}`));
        }
        if (category.user.toString() !== req.user.id) {
            console.warn("Not authorized to delete this category");
            return next(new apiError(401, "Not authorized to delete this category"));
        }
        await category.deleteOne();
        console.log("Category deleted:", req.params.id);
        return res.status(200).json(new apiResponse(200, {}, "Category deleted successfully"));
    } catch (error) {
        console.error("Error deleting category:", error);
        next(new apiError(500, error.message));
    }
};