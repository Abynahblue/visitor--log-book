import { ObjectId } from "mongoose"
import VisitModel from "../models/visit.model"

const guestFromLogsService = async (id: string) => {
    return VisitModel.findOne({ guest_id: id, sign_in: { $exists: true } });
}

const checkInServices = async (guestId: ObjectId) => {
    return VisitModel.aggregate([
        {
            $match: {
                _id: guestId
            }
        },
        {
            $lookup: {
                from: "hosts",
                localField: "hostId",
                foreignField: "id",
                as: "host"
            }
        },
        {
            $unwind: "$host"
        },
        {
            $lookup: {
                from: "guests",
                localField: "guestId",
                foreignField: "id",
                as: "guest"
            }
        },
        {
            $unwind: "$guest"
        },
        {
            $project: {
                _id: 1, 
                sign_in:'$visitLogs.sign_in',
                guest: {
                    _id: '$guest._id',
                    first_name: '$guest.first_name',
                    last_name: '$guest.last_name',
                    email: '$guest.email',
                },
                host: {
                    _id: '$host._id',
                    host_firstname: '$host.host_firstname',
                    host_lastname: '$host.host_lastname',
                    host_email: '$host.host_email'
                }
            }
        }
    ])
}

const checkOutServices = async (guestId: ObjectId) => {
    return VisitModel.aggregate([
        {
            $match: {
                _id: guestId
            }
        },
        {
            $lookup: {
                from: "hosts",
                localField: "hostId",
                foreignField: "id",
                as: "host"
            }
        },
        {
            $unwind: "$host"
        },
        {
            $lookup: {
                from: "guests",
                localField: "guestId",
                foreignField: "id",
                as: "guest"
            }
        },
        {
            $unwind: "$guest"
        },
        {
            $project: {
                _id: 1, 
                sign_out:'$visitLogs.sign_out',
                guest: {
                    _id: '$guest._id',
                    first_name: '$guest.first_name',
                    last_name: '$guest.last_name',
                    email: '$guest.email',
                },
                host: {
                    _id: '$host._id',
                    host_firstname: '$host.host_firstname',
                    host_lastname: '$host.host_lastname',
                    host_email: '$host.host_email'
                }
            }
        }
    ])
}


export {
    checkInServices,
    guestFromLogsService,
    checkOutServices
}