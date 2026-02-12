import { Router } from "express";
import verifyToken from "../middleware/auth";
import { EventController } from "../Controllers/event_controller";

const router: Router = Router();
const controller = new EventController();
router.get(
  "/napicsepp/events",
  verifyToken,
  controller.getEvent.bind(controller),
);

router.post(
  "/napicsepp/event",
  verifyToken,
  controller.postEvent.bind(controller),
);
router.delete(
  "/napicsepp/event/:id",
  verifyToken,
  controller.deleteEvent.bind(controller),
);
router.put(
  "/napicsepp/event/:id",
  verifyToken,
  controller.putEvent.bind(controller),
);

export default router;
