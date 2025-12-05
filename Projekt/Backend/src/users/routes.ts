import {Router} from "express";
import { signIn } from "./userController";

const router: Router = Router();

router.post("/login", signIn);

export default router;