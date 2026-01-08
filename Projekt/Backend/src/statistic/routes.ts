import { Router } from "express";
import { systemStatistic, profileStatistic } from "./statisticController";
import verifyToken from "../middleware/auth";

const router:Router = Router();
router.get("/napicsepp/system-stats", systemStatistic);
router.get("/napicsepp/stats", verifyToken, profileStatistic)

export default router;