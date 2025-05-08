import { Router } from "express";
import { registerUser,ShowAllUsers,loginUser,  getCurrentUser ,logoutUser ,changePassword, updateMe} from "../controllers/User.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { authenticate } from "../middlewares/auth.middlewares.js";

const router = Router();


router.post("/register", upload.fields([
    { name: "profilepicture", maxCount: 1 },
]), registerUser);

router.post("/change-password", authenticate, changePassword);
router.post("/login", loginUser);
router.get("/all",ShowAllUsers)
router.get("/me", authenticate, getCurrentUser);
router.put("/me", authenticate, upload.fields([
    { name: "profilepicture", maxCount: 1 },
]), updateMe);
router.post("/logout", authenticate, logoutUser);





export { router as userRouter };
