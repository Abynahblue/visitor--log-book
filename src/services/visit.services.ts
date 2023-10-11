import { ObjectId, Types } from "mongoose"
import VisitModel from "../models/visit.model"
import GuestModel from "../models/guest.model";
import { IVisit } from "../interface/visit.interface";
import { visitRoute } from "../routes/visit.route";

const createVisitLogService = async (data: IVisit) => VisitModel.findOne(data)

const guestFromLogsService = async (id: string) => {
    return VisitModel.findOne({ guest_id: id, sign_in: { $exists: true } });
}
const getAllVisitLogsServices = async () => VisitModel.find();
const checkInServices = async (guestId: Types.ObjectId) => {
    return VisitModel.findOne({
        guest_id: guestId,
    }).populate("guest_id user_id")
}
        

const checkOutServices = async (guestId: Types.ObjectId) => {
    return VisitModel.findOne({
        guest_id: guestId
    }).populate("guest_id host_id")
}



export {
    checkInServices,
    guestFromLogsService,
    checkOutServices,
    createVisitLogService,
    getAllVisitLogsServices
}