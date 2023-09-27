import express, { Express, IRouter } from "express"
import { guestSchema, validateResource } from "../middleware/validateResources"
import { addUser, checkIn, checkOut, getAllGuests } from "./guest.controller"

export const guestRoute = (router: IRouter) => {
    router.route("/guest")
        .post([validateResource(guestSchema), addUser])
        .get(getAllGuests)
    router
        .route("/guest/:id")
        .post(checkIn)
    router
        .route("/checkout/:id")
        .post(checkOut)
}