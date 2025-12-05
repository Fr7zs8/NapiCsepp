import {Router} from "express";
import { deleteDataFromId, getEventByUser, postEvents } from "./eventController";

const router:Router = Router();

router.get("/event/:id", getEventByUser);
router.post("/event", postEvents);
router.delete("/event/:id", deleteDataFromId);

export default router