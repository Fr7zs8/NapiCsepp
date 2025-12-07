import {Router} from "express";
import { getAllActivity, getHabits } from "./avtivityController";
import verifyToken from "../middleware/auth";

const router:Router = Router();

router.get("/activities", verifyToken, getAllActivity);
router.get("/activities/habits", verifyToken, getHabits);

export default router;
