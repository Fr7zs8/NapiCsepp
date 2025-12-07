import {Router} from "express";
import { getUser, signIn, getAllUser } from "./userController";
import verifyToken from "../middleware/auth";

const router: Router = Router();

router.post("/login", signIn);
router.get("/profile", verifyToken, getUser);
router.get("/users", verifyToken, getAllUser);

export default router;