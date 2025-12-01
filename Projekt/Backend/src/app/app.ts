import router from "../routes/routes";
import cors from "cors";
import bodyParser from "body-parser";
import express from "express";

const app = express();

app.use(cors({origin: "*"}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/", router);

export default app;