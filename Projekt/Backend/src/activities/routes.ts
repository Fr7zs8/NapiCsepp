import {Router} from "express";
import { deleteActivity, getAllActivity, getHabits, postActivity, putActivity } from "./avtivityController";
import verifyToken from "../middleware/auth";

const router:Router = Router();

router.get("/activities", verifyToken, getAllActivity);
router.get("/activities/habits", verifyToken, getHabits);
router.post("/activities", verifyToken, postActivity);
router.delete("/activities/:id", verifyToken, deleteActivity);
router.put("/activities/:id", verifyToken, putActivity);

export default router;
