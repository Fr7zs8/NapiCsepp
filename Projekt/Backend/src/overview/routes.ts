import { Router } from "express";
import { getEveryThing } from "./overviewController";
import verifyToken from "../src2/middleware/auth";

const router: Router = Router();
router.get("/napicsepp/overview", verifyToken, getEveryThing);

export default router;
