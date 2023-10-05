import { IAdmin } from "../interface/admin.interface";
import { AdminModel } from "../models/admin.model";

const createAdminServices = async (data: IAdmin) => {
    return AdminModel.create(data)
}
const getAdminByIdService = async (id: string) => AdminModel.findById(id)
const getAdminService = async (email: string) => AdminModel.findOne({email})
const getAllAdminServices = async () => AdminModel.find()

export {
    createAdminServices,
    getAdminService,
    getAllAdminServices,
    getAdminByIdService
}