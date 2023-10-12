import { IRouter } from "express"
import { protect, restrictTo, validateResource } from "../middleware/validateResources"
import { adminLogin, createUser, forgotPasswordreset, initiateForgotPasswordreset, login, updatePassword } from "../controllers/auth.controller"
import { deleteUser, getAllHosts, getAllUsers, getUser, updateUser } from "../controllers/user.controller"

export const userRoute = (router: IRouter) => {
    router.route("/user")
        .post(createUser)
        .put(protect, updatePassword)
        .get(protect, getAllUsers)
    router.route("/user/login").post(login)
    router.route("/user/adminLogin").post(adminLogin, restrictTo("Admin"))
    router.route("/user/initiate-reset").post(initiateForgotPasswordreset)
    router.route("/user/reset-password").post(forgotPasswordreset)
    router.route("/user/:id").get(protect, getUser)
    router.route("/hosts").get(getAllHosts)
    router.route("/user/:id").put(updateUser)
    router.route("/user/:id").get(restrictTo("Admin"),deleteUser)
    // router.route("/admin/host/register").post([validateResource(Schema), registerHost])
    // router.route("/admin/host/:id").delete(deleteHost)
}