import { Router } from "express";
import { systemStatistic } from "./statisticController";

const router:Router = Router();
router.get("/napicsepp/system-stats", systemStatistic)

export default router;