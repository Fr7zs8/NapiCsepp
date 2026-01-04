import {Router} from "express";
import { getUser, signIn, getAllUser } from "./userController";
import verifyToken from "../middleware/auth";

const router: Router = Router();

router.post("/napicsepp/login", signIn);
router.get("/napicsepp/profile", verifyToken, getUser);
router.get("/napicsepp/users", verifyToken, getAllUser);

export default router;