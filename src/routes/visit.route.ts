import { IRouter } from "express";
import { checkIn, checkOut } from "../controllers/visit.controller";

export const visitRoute = (router: IRouter) => {
    router.route("/visitLogs/check-in/:id").post(checkIn)
    router.route("/visitLog/check-out/:id").post(checkOut)
}