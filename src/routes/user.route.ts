import { IRouter } from "express"
import { protect, restrictTo, validateResource } from "../middleware/validateResources"
import { Schema } from "zod"
import { createUser, forgotPasswordreset, initiateForgotPasswordreset, login, updatePassword } from "../controllers/auth.controller"
import { getAllUsers, getUser } from "../controllers/user.controller"

export const userRoute = (router: IRouter) => {
    router.route("/user")
        .post([validateResource(Schema), createUser])
        .put(protect, updatePassword)
        .get(protect, getAllUsers)
    router.route("/user/login").post(login)
    router.route("/user/initiate-reset").post(initiateForgotPasswordreset)
    router.route("/user/reset-password").post(forgotPasswordreset)
    router.route("/user/:id").get(protect,getUser)


    // router.route("/admin/host/register").post([validateResource(Schema), registerHost])
    // router.route("/admin/host/:id").delete(deleteHost)
}