import { Router } from "express";
import { getUser, signIn, getAllUser, regiszter } from "./userController";
import verifyToken from "../src2/middleware/auth";

const router: Router = Router();

router.post("/napicsepp/login", signIn);
router.get("/napicsepp/profile", verifyToken, getUser);
router.get("/napicsepp/users", verifyToken, getAllUser);
router.post("/napicsepp/regisztrate", regiszter);

export default router;
