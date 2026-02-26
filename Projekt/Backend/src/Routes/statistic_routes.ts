import { Router } from "express";
import { StatisticController } from "../Controllers/statistic_controller";
import verifyToken from "../middleware/auth";

const router: Router = Router();

const controller = new StatisticController();

router.get(
  "/napicsepp/system-stats",
  verifyToken,
  controller.systemStatistic.bind(controller),
);

router.get(
  "/napicsepp/stats",
  verifyToken,
  controller.profileStatistic.bind(controller),
);

//abi - kellett egy get idkkal
router.get(
  "/napicsepp/stats/:userId",
  verifyToken,
  controller.userProfileStatistic.bind(controller),
);

export default router;
