import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

import { errorHandler } from "./middlewares/error.middlewares.js";

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
));




//common middleware
app.use(express.json(
    {
        limit: '16kb'
    }
));

app.use(express.urlencoded(
    {
        extended: true,
        limit: '16kb'
    }
));

app.use(express.static('public'));


app.use(cookieParser());

// app.use("/", (req, res) => {
//     res.send("Welcome to the API")
// })


import { userRouter } from "./routes/user.routes.js";
app.use("/api/users", userRouter)

import { transactionRouter } from "./routes/transaction.routes.js";
app.use("/api/transactions", transactionRouter)


import { categoryRouter } from "./routes/category.routes.js";
app.use("/api/categories", categoryRouter)


import { budgetRouter } from "./routes/budget.routes.js";
app.use("/api/budgets", budgetRouter)

import { goalsRouter } from './routes/goal.routes.js';
app.use("/api/goals", goalsRouter)


import { dashboardRouter } from './routes/dashboard.routes.js';
app.use("/api/dashboard", dashboardRouter)







app.use(errorHandler);


export {app}