import router from "../testRoute/routes";
import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import eventRouter from "../Routes/event_routes";
import userRouter from "../Routes/user_routes";
import activityRouter from "../Routes/activity_routes";
import typesRouter from "../Routes/type_routes";
import difficultyRouter from "../Routes/difficulty_routes";
import overviewRouter from "../Routes/overview_routes";
import statisticRouter from "../Routes/statistic_routes";
import cron from "node-cron";
import { resetHabitState } from "../middleware/cron";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

cron.schedule("0 0 * * *", () => {
  resetHabitState();
});

app.use("/", router);
app.use("/", eventRouter);
app.use("/", userRouter);
app.use("/", activityRouter);
app.use("/", typesRouter);
app.use("/", difficultyRouter);
app.use("/", overviewRouter);
app.use("/", statisticRouter);

export default app;
