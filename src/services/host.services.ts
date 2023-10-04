import { IHost } from "../interface/host.interface";
import HostModel from "../models/host.model";

const createHostServices = async (data: IHost) => {
    return await HostModel.create(data)
}

const getHostService = async (id: string) => HostModel.findById(id);

const getAllHostServices = async () => HostModel.find()

const updateHostServices = async (id: string) => HostModel.findByIdAndUpdate(id)

const deleteHostServices = async (id: string) => HostModel.findByIdAndDelete(id)

const searchHostsServices = async () => {
    return HostModel.aggregate([
       
        {
            $project: {
               password: 0
           } 
        }
    ])
}



export {
    createHostServices,
    getAllHostServices,
    getHostService,
    updateHostServices,
    deleteHostServices, 
    searchHostsServices
}