import express, { Express, IRouter } from "express"
import { guestSchema, protect, restrictTo, validateResource } from "../middleware/validateResources"
import { registerGuest, getAllGuests, getGuest, searchUsers, login, logout, getHostGuests } from "../controllers/guest.controller"
import { generateQrCode, loginWithQRCode } from "../controllers/qrcode.controller"

export const guestRoute = (router: IRouter) => {
    router.route("/guest")
        .post(registerGuest)
        .get(getAllGuests)
    router
        .route("/guest/search")
        .get(searchUsers)
    router
        .route("/guest/:id")
        .get(getGuest)
    router
        .route("/guest/login")
        .post(login)

    router.route("/guest/generateQrCode")
        .post(generateQrCode)
    router
        .route("/guest/qrCodeLogin")
        .post(loginWithQRCode)
    router
        .route("/guest/logout")
        .put(logout)
    router
        .route("/hostGuests/:id")
        .get(protect, getHostGuests)
}