import { Router } from "express";
import { DifficultyController } from "../Controllers/difficulty_controller";

const router: Router = Router();

const controller = new DifficultyController();

router.get(
  "/napicsepp/difficulties",
  controller.getDifficulties.bind(controller),
);

export default router;
