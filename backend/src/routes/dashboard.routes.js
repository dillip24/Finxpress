import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controllers.js";
import { authenticate } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/summary", authenticate, getDashboardSummary);

export { router as dashboardRouter };