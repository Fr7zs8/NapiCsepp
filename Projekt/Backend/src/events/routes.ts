import {Router} from "express";
import { getAllEvent } from "./eventController";

const router:Router = Router();

router.get("/event", getAllEvent);

export default router