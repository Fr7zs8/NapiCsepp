import { Router } from "express";
import { TypeController } from "../Controllers/type_controller";

const router: Router = Router();

const controller = new TypeController();

router.get("/napicsepp/types", controller.getTypes.bind(controller));

export default router;
