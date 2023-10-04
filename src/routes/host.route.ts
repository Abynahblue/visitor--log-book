import { IRouter } from "express";
import { getConfirmationCode, getAllHosts, loginHost, updatePassword, getHost } from "../controllers/host.controller";

export const hostRoute = (router: IRouter) => {
    router.route("/host")
        .post(loginHost)
        .get(getAllHosts)
    router.route("/host/confirmation-code").post(getConfirmationCode)
    router.route("/host/reset").put(updatePassword)
    router.route("/host/:id").get(getHost)
}