
import { Router } from "express";
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetProgress
} from "../controllers/budget.controllers.js";
import { authenticate } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/")
  .get(authenticate, getBudgets)
  .post(authenticate, createBudget);

router.route("/:id")
  .get(authenticate, getBudget)
  .put(authenticate, updateBudget)
  .delete(authenticate, deleteBudget);

router.get("/:id/progress", authenticate, getBudgetProgress);

export { router as budgetRouter };