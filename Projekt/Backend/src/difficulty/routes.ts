import { Router } from "express";
import { getDifficulties } from "./difficultyController";

const router: Router = Router();

router.get("/difficulties", getDifficulties);

export default router;