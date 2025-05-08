import { Router } from "express";
import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} from "../controllers/category.controllers.js";


import { authenticate } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(authenticate);

router.post("/", createCategory);           // Create category
router.get("/", getCategories);             // Get all categories for user
router.put("/:id", updateCategory);         // Update category by id
router.delete("/:id", deleteCategory);      // Delete category by id

export { router as categoryRouter };