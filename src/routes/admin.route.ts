import { IRouter } from "express"
import { deleteHost, getConfirmationCode, loginAdmin, registerAdmin, registerHost, updateAdminPassword } from "../controllers/admin.controller"

export const adminRoute = (router: IRouter) => {
    router.route("/admin")
        .post(registerAdmin)
        .put(updateAdminPassword)
    router.route("/admin/login").post(loginAdmin)
    router.route("/admin/confirmation-code").post(getConfirmationCode)
    router.route("/admin/host/register").post(registerHost)
    router.route("/admin/host/:id").delete(deleteHost)
}