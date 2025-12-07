import router from "../routes/routes";
import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import eventRouter from "../events/routes";
import userRouter from "../users/routes";
import activityRouter from "../activities/routes";

const app = express();

app.use(cors({origin: "*"}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/", router);
app.use("/", eventRouter);
app.use("/", userRouter);
app.use("/", activityRouter);

export default app;