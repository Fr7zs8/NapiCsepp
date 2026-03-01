import { Router } from "express";
import { OverviewController } from "../Controllers/overview_controller";
import verifyToken from "../middleware/auth";

const router: Router = Router();

const controller = new OverviewController();

router.get(
  "/napicsepp/overview",
  verifyToken,
  controller.getOverview.bind(controller),
);

export default router;
