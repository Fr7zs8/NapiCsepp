import { Router } from "express";
import { UserController } from "../Controllers/user_controller";
import verifyToken from "../middleware/auth";

const router: Router = Router();

const controller = new UserController();

router.post("/napicsepp/login", controller.login.bind(controller));
router.get(
  "/napicsepp/profile",
  verifyToken,
  controller.getUser.bind(controller),
);
router.get(
  "/napicsepp/users",
  verifyToken,
  controller.getAllUser.bind(controller),
);

router.post("/napicsepp/regisztrate", controller.register.bind(controller));

router.put("/napicsepp/users/:id", verifyToken, controller.putUser.bind(controller));

router.get("/napicsepp/moderators", verifyToken, controller.getModerators.bind(controller))
export default router;
