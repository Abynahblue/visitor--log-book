import { IRouter } from "express";
import { checkOut, hostVisitorRecords, setAppointment } from "../controllers/visit.controller";

export const visitRoute = (router: IRouter) => {
    router.route("/visitLogs").get(hostVisitorRecords)
    router.route("/visitLog/check-out/:id").post(checkOut)
    router.route("/visit/setAppointment/:id").post(setAppointment)
}