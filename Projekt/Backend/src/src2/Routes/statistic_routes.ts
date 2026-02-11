import { Router } from "express";
import { StatisticController } from "../Controllers/statistic_controller";

const router: Router = Router();

const controller = new StatisticController();

router.get(
  "/napicsepp/system-stats",
  controller.systemStatistic.bind(controller),
);

router.get("/napicsepp/stats", controller.profileStatistic.bind(controller));

export default router;
