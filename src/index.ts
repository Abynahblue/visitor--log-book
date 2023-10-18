import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv"
import globalErrorHandler from "./utility/globalErroHandler";
import { guestRoute } from "./routes/guest.route";
import { userRoute } from "./routes/user.route";
import { visitRoute } from "./routes/visit.route";
import cors from "cors";
dotenv.config();


const app: Express = express();
const router = express.Router();

app.use(express.json());
app.use(cors())

app.use("/api/v1", router)
guestRoute(router)
userRoute(router)
visitRoute(router)

app.get("*", (req, res, next) => {
    res.send("integration successful")
})

app.use(globalErrorHandler)

export { app };