import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv"
import globalErrorHandler from "./utility/globalErroHandler";
import { guestRoute } from "./guest/guest.route";
dotenv.config();


const app: Express = express();
const router = express.Router();

app.use(express.json());


app.use("/api/v1", router)
guestRoute(router)

app.get("*", (req, res, next) => {
    res.send("integration successful")
})

app.use(globalErrorHandler)

export { app };