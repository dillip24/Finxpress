import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./database/index.js";

dotenv.config({
    path: "./.env"
}
);


const PORT = process.env.PORT || 7000


connectDB()
.then( () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      }
      )
    })
.catch((error) => {
    console.error("Error connecting to database", error);

}
)

// app.get("/", (req, res) => {
//     res.send("API is running...")
// })