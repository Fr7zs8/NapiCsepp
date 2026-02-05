import {Router} from "express";
import { deleteEvent, getEvent, postEvent, putEvent } from "./eventController";
import verifyToken from "../middleware/auth";

const router:Router = Router();

router.get("/napicsepp/events", verifyToken, getEvent);
router.post("/napicsepp/event", verifyToken, postEvent);
router.delete("/napicsepp/event/:id", verifyToken, deleteEvent);
router.put("/napicsepp/event/:id", verifyToken, putEvent);

export default router