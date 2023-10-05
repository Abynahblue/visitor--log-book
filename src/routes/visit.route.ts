import { IRouter } from "express";
import { checkIn, checkOut, setAppointment } from "../controllers/visit.controller";

export const visitRoute = (router: IRouter) => {
    router.route("/visitLogs/check-in/:id").post(checkIn)
    router.route("/visitLog/check-out/:id").post(checkOut)
    router.route("/visit/setAppointment/:id").post(setAppointment)
}