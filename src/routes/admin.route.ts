import { IRouter } from "express"
import { deleteHost, getConfirmationCode, loginAdmin, registerAdmin, registerHost, updateAdminPassword } from "../controllers/admin.controller"
import { validateResource } from "../middleware/validateResources"
import { Schema } from "zod"

export const adminRoute = (router: IRouter) => {
    router.route("/admin")
        .post([validateResource(Schema), registerAdmin])
        .put(updateAdminPassword)
    router.route("/admin/login").post(loginAdmin)
    router.route("/admin/confirmation-code").post(getConfirmationCode)
    router.route("/admin/host/register").post([validateResource(Schema), registerHost])
    router.route("/admin/host/:id").delete(deleteHost)
}