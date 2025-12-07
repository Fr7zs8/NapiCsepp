import {Router} from "express";
import { deleteEvent, getEvent, postEvent, putEvent } from "./eventController";
import verifyToken from "../middleware/auth";

const router:Router = Router();

router.get("/event", verifyToken, getEvent);
router.post("/event", verifyToken, postEvent);
router.delete("/event/:id", verifyToken, deleteEvent);
router.put("/event/:id", verifyToken, putEvent);

export default router