import { Router } from "express";
import { putActivity } from "./avtivityController";
import verifyToken from "../middleware/auth";
import {
  getAllActivity,
  getHabits,
  postActivity,
  deleteActivity,
} from "../src2/Controllers/activity_controller";

const router: Router = Router();

router.get("/napicsepp/activities", verifyToken, getAllActivity);
router.get("/napicsepp/activities/habits", verifyToken, getHabits);
router.post("/napicsepp/activities", verifyToken, postActivity);
router.delete("/napicsepp/activities/:id", verifyToken, deleteActivity);
router.put("/napicsepp/activities/:id", verifyToken, putActivity);

export default router;
