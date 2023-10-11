import express, { Express, IRouter } from "express"
import { guestSchema, validateResource } from "../middleware/validateResources"
import { registerGuest,  getAllGuests, getGuest, searchUsers, login } from "../controllers/guest.controller"
import generateQrCode from "../controllers/qrcode.controller"

export const guestRoute = (router: IRouter) => {
    router.route("/guest")
        .post( registerGuest)
        .get(getAllGuests)
    router
        .route("/guest/search")
        .get(searchUsers)
    router
        .route("/guest/:id")
        .get(getGuest)
    router.route("/guest/login").post(login)

    router.route("/guest/generateQrCode")
        .post(generateQrCode)
}