import { IUser } from "../interface/user.interface";
import UserModel from "../models/user.model";

const createUserServices = async (data: IUser) => {
    return UserModel.create(data)
}
const getUserByIdService = async (id: string) => UserModel.findById(id).populate("userId")
const getUserByIDService = async (id: string) => UserModel.findById(id)
const getUserService = async (email: string) => UserModel.findOne({ email }).exec();
const getLoggedInUsers = async () => UserModel.find({ loggedIn: true })
const getAllUserServices = async () => UserModel.find()
const updateUserServices = async (id: string, data: any) => UserModel.findByIdAndUpdate({ _id: id }, data, { new: true });
const deleteUserServices = async (id: string) => UserModel.findByIdAndDelete(id)

const getAllHostsServices = async (keyword = "", page = 1, select = "") => {
    return UserModel.find({
        role: "Host"
    }).select(select)
}
const getUserServices = async () => {
    return UserModel.find({
        role: "SuperAdmin"
    })
}
const getAllHostsServicesById = async (id: string, select = "") => {
    return UserModel.find({
        id: String,
    }, 'id password fullName email phone role')
}
export {
    createUserServices,
    getUserService,
    getAllUserServices,
    getUserByIdService,
    updateUserServices,
    deleteUserServices,
    getAllHostsServices,
    getUserByIDService,
    getAllHostsServicesById,
    getLoggedInUsers,
    getUserServices
}