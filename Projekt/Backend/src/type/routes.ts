import { Router } from "express";
import { getTypes } from "./typeController";

const router: Router = Router();

router.get("/types", getTypes);

export default router;