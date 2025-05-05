import { Router } from "express";
import { createTransaction , getTransactions} from "../controllers/transaction.controllers.js";

const router = Router();



router.get("/", (req, res) => {
    res.send("Transaction route is working");
    });

router.post("/add", createTransaction);

router.get("/get/:user", getTransactions);


// router.get("/get", (req, res) => {
//     res.send("Transaction route is working");
//     });


export { router as transactionRouter };
