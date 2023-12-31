import { IRouter } from "express"
import { protect, restrictTo, validateResource } from "../middleware/validateResources"
import { createUser, forgotPasswordreset, initiateForgotPasswordreset, login, updatePassword } from "../controllers/auth.controller"
import { deleteUser, getAllHosts, getAllUsers, getUser, updateUser } from "../controllers/user.controller"
import { confirmHostEmail, verifyCode } from "../controllers/qrcode.controller"

export const userRoute = (router: IRouter) => {
    router.route("/user")
        .post(createUser)
        .get(protect, getAllUsers)
    router.route("/user/:id").put(updatePassword)
    router.route("/user/login").post(login)
    //router.route("/user/adminLogin").post(adminLogin, restrictTo("Admin"))
    router.route("/user/initiate-reset").post(initiateForgotPasswordreset)
    router.route("/user/reset-password").post(forgotPasswordreset)
    router.route("/user/:id").get(protect, getUser)
    router.route("/hosts").get(getAllHosts)
    router.route("/users/:id").put(updateUser)
    router.route("/users/:id").delete(restrictTo("Admin"), deleteUser)
    router.route("/verify-email").post(confirmHostEmail)
    router.route("/confirmation-code").post(verifyCode)
}