import express, { Express, IRouter } from "express"
import { guestSchema, validateResource } from "../middleware/validateResources"
import { registerGuest, checkIn, checkOut, getAllGuests } from "../controllers/guest.controller"

export const guestRoute = (router: IRouter) => {
    router.route("/guest")
        .post([validateResource(guestSchema), registerGuest])
        .get(getAllGuests)
    router
        .route("/guest/:id")
        .post(checkIn)
    router
        .route("/checkout/:id")
        .post(checkOut)
}