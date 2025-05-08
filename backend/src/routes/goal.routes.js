import { Router } from "express";
import {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getGoalProgress
} from "../controllers/goals.controllers.js";
import { authenticate } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/")
  .get(authenticate, getGoals)
  .post(authenticate, createGoal);

router.route("/:id")
  .get(authenticate, getGoal)
  .put(authenticate, updateGoal)
  .delete(authenticate, deleteGoal);

router.put("/:id/progress", authenticate, updateGoalProgress);
router.get("/:id/progress", authenticate, getGoalProgress);


export { router as goalsRouter };