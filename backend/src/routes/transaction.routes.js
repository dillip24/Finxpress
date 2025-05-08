import { Router } from "express";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByCategory,
  getTransactionsByDateRange,
  getTransactionStats
} from "../controllers/transaction.controllers.js";
import { authenticate } from "../middlewares/auth.middlewares.js";

const router = Router();

router
  .route("/")
  .get(authenticate, getTransactions)
  .post(authenticate, createTransaction);

router
  .route("/:id")
  .get(authenticate, getTransaction)
  .put(authenticate, updateTransaction)
  .delete(authenticate, deleteTransaction);

router.get("/category/:categoryId", authenticate, getTransactionsByCategory);
router.get("/daterange", authenticate, getTransactionsByDateRange);
router.get("/stats", authenticate, getTransactionStats);

export { router as transactionRouter };