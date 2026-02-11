import router from "../routes/routes";
import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import eventRouter from "../events/routes";
import userRouter from "../users/routes";
import activityRouter from "../src2/Routes/activity_routes";
import typesRouter from "../type/routes";
import difficultyRouter from "../src2/Routes/difficulty_routes";
import overviewRouter from "../overview/routes";
import statisticRouter from "../statistic/routes";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", router);
app.use("/", eventRouter);
app.use("/", userRouter);
app.use("/", activityRouter);
app.use("/", typesRouter);
app.use("/", difficultyRouter);
app.use("/", overviewRouter);
app.use("/", statisticRouter);

export default app;
