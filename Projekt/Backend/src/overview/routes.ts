import { Router } from "express";
import { getEveryThing } from "./overviewController";
import verifyToken from "../middleware/auth";

const router: Router = Router();
router.get("/napicsepp/overview", verifyToken, getEveryThing)

export default router;