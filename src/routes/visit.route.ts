import { IRouter } from "express";
import { checkOut, getMonthlyVisits, hostVisitorRecords, setAppointment } from "../controllers/visit.controller";
import { protect } from "../middleware/validateResources";

export const visitRoute = (router: IRouter) => {
    router.route("/visitLogs").get(protect, hostVisitorRecords)
    router.route("/visitLog/check-out/:id").post(checkOut)
    router.route("/visit/setAppointment/:id").post(setAppointment),
        router.route("/monthly-visits").get(getMonthlyVisits)
}