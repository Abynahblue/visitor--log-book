import { ObjectId, Types } from "mongoose"
import VisitModel from "../models/visit.model"
import GuestModel from "../models/guest.model";
import { IVisit } from "../interface/visit.interface";
import { visitRoute } from "../routes/visit.route";

const createVisitLogService = (data: IVisit) => VisitModel.findOne(data)
const guestFromLogsService = async (id: string) => {
    return VisitModel.findOne({ guest_id: id, sign_in: { $exists: true } });
}

const checkInServices = async (guestId: Types.ObjectId) => {
    return VisitModel.findOne({
        guest_id: guestId
    }).populate("guest_id host_id")
}
        

const checkOutServices = async (guestId: Types.ObjectId) => {
    return VisitModel.findOne({
        guest_id: guestId
    }).populate("guest_id host_id")
}

const getAppointmentServices = async (hostId: Types.ObjectId, guest_id: Types.ObjectId) => {
    return VisitModel.findOne({
        host_id: hostId,
        guest_id: guest_id
    }).populate("host_id guest_id")
}

export {
    checkInServices,
    guestFromLogsService,
    checkOutServices,
    createVisitLogService,
    getAppointmentServices
}