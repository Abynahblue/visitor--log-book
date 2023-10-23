import { ObjectId, Types } from "mongoose"
import VisitModel from "../models/visit.model"
import GuestModel from "../models/guest.model";
import { IVisit } from "../interface/visit.interface";
import { visitRoute } from "../routes/visit.route";

const createVisitLogService = async (data: IVisit) => VisitModel.findOne(data)

const guestFromLogsService = async (id: string) => {
    return VisitModel.findOne({ _id: id });
}
const getAllVisitLogsServices = async () => VisitModel.find().populate('guest_id hostEmail');

const getLiveVisitsServices = async () => VisitModel.find({ "sign_out.status": false }).populate('guest_id hostEmail')

const hostVisitsService = async (userId: string) => {
    return VisitModel.find({
        user_id: userId,
    }).populate("guest_id user_id")
}


const checkOutServices = async (guestId: Types.ObjectId) => {
    return VisitModel.findOne({
        guest_id: guestId
    }).populate("guest_id host_id")
}

const getMonthlyVisitsServices = async () => {
    return VisitModel.aggregate([
        {
            $group: {
                _id: {
                    $month: '$sign_in'
                },
                Visit: { $sum: 1 },
            }
        },
        {
            $project: {
                Months: {
                    $switch: {
                        branches: [
                            { case: { $eq: ['$_id', 1] }, then: 'January' },
                            { case: { $eq: ['$_id', 2] }, then: 'February' },
                            { case: { $eq: ['$_id', 3] }, then: 'March' },
                            { case: { $eq: ['$_id', 4] }, then: 'April' },
                            { case: { $eq: ['$_id', 5] }, then: 'May' },
                            { case: { $eq: ['$_id', 6] }, then: 'June' },
                            { case: { $eq: ['$_id', 7] }, then: 'July' },
                            { case: { $eq: ['$_id', 8] }, then: 'August' },
                            { case: { $eq: ['$_id', 9] }, then: 'September' },
                            { case: { $eq: ['$_id', 10] }, then: 'October' },
                            { case: { $eq: ['$_id', 11] }, then: 'November' },
                            { case: { $eq: ['$_id', 12] }, then: 'December' }
                        ],
                        default: 'Invalid Month'
                    }
                },
                Visit: 1,
                _id: 0
            }
        }
    ]);
}

export {
    hostVisitsService,
    guestFromLogsService,
    checkOutServices,
    createVisitLogService,
    getAllVisitLogsServices,
    getMonthlyVisitsServices,
    getLiveVisitsServices
}