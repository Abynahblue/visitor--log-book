import { IRouter } from "express";
import { getConfirmationCode, getHosts, loginHost, updatePassword } from "../controllers/host.controller";

export const hostRoute = (router: IRouter) => {
    router.route("/host")
        .post(loginHost)
        .get(getHosts)
    router.route("/host/confirmation-code").post(getConfirmationCode)
    router.route("/host/reset").put(updatePassword)
}