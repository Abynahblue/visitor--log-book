import { IUser } from "../interface/user.interface";
import UserModel from "../models/user.model";

const createUserServices = async (data: IUser) => {
    return UserModel.create(data)
}
const getUserByIdService = async (id: string, select = "") => UserModel.findById(id).select(select)
const getUserByIDService = async (id: string) => UserModel.findById(id)
const getUserService = async (email: string) => UserModel.findOne({ email }).exec();
const getAllUserServices = async () => UserModel.find()
const updateUserServices = async (id: string, data: any) => UserModel.findByIdAndUpdate({ _id: id }, data, { new: true });
const deleteUserServices = async (id: string) => UserModel.findByIdAndDelete(id)

const getAllHosts = async (keyword = "", page = 1) => {
  return UserModel.find({
      role: "Host"
    })
}

export {
    createUserServices,
    getUserService,
    getAllUserServices,
    getUserByIdService,
    updateUserServices,
    deleteUserServices,
   getAllHosts,
    getUserByIDService
}