import {Router} from "express";
import { deleteDataFromId, getEventByUser, postEvents } from "./eventController";
import verifyToken from "../middleware/auth";

const router:Router = Router();

router.get("/event", verifyToken, getEventByUser);
router.post("/event", verifyToken, postEvents);
router.delete("/event/:id", deleteDataFromId);

export default router