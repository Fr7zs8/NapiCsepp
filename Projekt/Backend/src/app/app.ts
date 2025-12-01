import router from "../routes/routes";
import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import eventRouter from "../events/routes"

const app = express();

app.use(cors({origin: "*"}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/", router);
app.use("/", eventRouter)

export default app;