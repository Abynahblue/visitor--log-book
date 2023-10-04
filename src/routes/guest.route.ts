import express, { Express, IRouter } from "express"
import { guestSchema, validateResource } from "../middleware/validateResources"
import { registerGuest, searchHosts,  getAllGuests, getGuest } from "../controllers/guest.controller"

export const guestRoute = (router: IRouter) => {
    router.route("/guest")
        .post([validateResource(guestSchema), registerGuest])
        .get(getAllGuests)
    router
        .route("/guest/search")
        .get(searchHosts)
    router
        .route("/guest/:id")
        .get(getGuest)
}