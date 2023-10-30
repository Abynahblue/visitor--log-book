import { IRouter } from "express";
import { checkOut, getMonthlyVisits, getliveVisits, hostVisitorRecords } from "../controllers/visit.controller";
import { protect } from "../middleware/validateResources";
import { setAppointment } from "../controllers/qrcode.controller";

export const visitRoute = (router: IRouter) => {
    router.route("/visitLogs").get(protect, hostVisitorRecords)
    router.route("/visitLog/check-out/:id").post(checkOut)
    router.route("/setAppointment").post(setAppointment),
        router.route("/monthly-visits").get(getMonthlyVisits)
    router.route("/live_visits").get(getliveVisits)
}