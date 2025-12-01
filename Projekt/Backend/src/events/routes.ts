import {Router} from "express";
import { getEventByUser } from "./eventController";

const router:Router = Router();

router.get("/event/:id", getEventByUser);

export default router