import { Router } from "express";
import verifyToken from "../../middleware/auth";
import { ActivityController } from "../Controllers/activity_controller";

const router: Router = Router();
const controller = new ActivityController();
router.get(
  "/napicsepp/activities",
  verifyToken,
  controller.getAllActivities.bind(controller),
);
router.get(
  "/napicsepp/activities/habits",
  verifyToken,
  controller.getHabits.bind(controller),
);
router.post(
  "/napicsepp/activities",
  verifyToken,
  controller.postActivity.bind(controller),
);
router.delete(
  "/napicsepp/activities/:id",
  verifyToken,
  controller.deleteActivity.bind(controller),
);
router.put(
  "/napicsepp/activities/:id",
  verifyToken,
  controller.putActivity.bind(controller),
);

export default router;
