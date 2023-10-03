import { IHost } from "../interface/host.interface";
import HostModel from "../models/host.model";

const createHostServices = async (data: IHost) => {
    return await HostModel.create(data)
}

const getHostService = async (host_email: string) => HostModel.findOne({ host_email });

const getAllHostServices = async () => HostModel.find()

const updateHostServices = async (id: string) => HostModel.findByIdAndUpdate(id)

const deleteHostServices = async (id: string) => HostModel.findByIdAndDelete(id)



export {
    createHostServices,
    getAllHostServices,
    getHostService,
    updateHostServices,
    deleteHostServices
}