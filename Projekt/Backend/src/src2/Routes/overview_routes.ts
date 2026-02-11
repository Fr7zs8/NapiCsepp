import { Router } from "express";
import { OverviewController } from "../Controllers/overview_controller";

const router: Router = Router();

const controller = new OverviewController();

router.get("/napicsepp/overview", controller.getOverview.bind(controller));

export default router;
