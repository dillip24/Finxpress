import { Router } from "express";
import { registerUser,ShowAllUsers,loginUser } from "../controllers/User.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();


router.post("/register", upload.fields([
    { name: "profilepicture", maxCount: 1 },
]), registerUser);


 router.post("/login", loginUser);
router.get("/all",ShowAllUsers)


export { router as userRouter };
