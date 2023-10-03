import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv"
import globalErrorHandler from "./utility/globalErroHandler";
import { guestRoute } from "./routes/guest.route";
import { adminRoute } from "./routes/admin.route";
import { hostRoute } from "./routes/host.route";
dotenv.config();


const app: Express = express();
const router = express.Router();

app.use(express.json());


app.use("/api/v1", router)
guestRoute(router)
adminRoute(router)
hostRoute(router)

app.get("*", (req, res, next) => {
    res.send("integration successful")
})

app.use(globalErrorHandler)

export { app };