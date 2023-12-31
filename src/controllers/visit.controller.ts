import { Request, Response, request } from "express"
import QRCode from "qrcode"
import catchAsync from "../utility/catchAsync"
import nodemailer from "nodemailer"
import { createGuestServices, getGuestByEmailService, getGuestService } from "../services/guest.services"
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse"
import { userResponses } from "../constants/guest.constants"
import { checkOutServices, getAllVisitLogsServices, getLiveVisitsServices, getMonthlyVisitsServices, hostVisitsService } from "../services/visit.services"
import VisitModel from "../models/visit.model"
import { Types } from "mongoose"
import GuestModel from "../models/guest.model"
import { generateTokenForGuest } from "../utility/userUitility"
import { getUserByIDService } from "../services/user.services"
import { CustomExpressRequest } from "../types"

const hostVisitorRecords = catchAsync(async (req: Request, res: Response) => {
    try {
        const userId = (req as CustomExpressRequest).currentUserId
        const userRole = (req as CustomExpressRequest).role
        let visits;
        if (userRole == "Host") {
            visits = await hostVisitsService(userId)
        } else {
            visits = await getAllVisitLogsServices()
        }
        return apiResponse(201, visits, null, res)
    } catch (error) {
        return apiErrorResponse(400, "Internal Server Error, Email not sent to host", res)

    }
})

const getliveVisits = async (req: Request, res: Response) => {
    try {
        const liveVisits = await getLiveVisitsServices()

        return apiResponse(200, liveVisits, null, res)
    } catch (err) {
        return apiErrorResponse(400, "Internal Server error", res)
    }
}


const checkOut = async (req: Request, res: Response) => {
    try {
        const guestId = req.params.id;

        try {
            const guest = await getGuestService(guestId)

            if (!guest) return apiErrorResponse(400, "Invalid user", res)

            // const host = await getHostService(hostId)
            // if(!host) return apiErrorResponse(400, "Host does not exist", res)

            const visitLog = await VisitModel.findOne({
                guest_id: guestId,

            })
            if (!visitLog) return apiErrorResponse(400, " Visitor is not signed in", res)

            visitLog.sign_out = {
                date: new Date(),
                status: true
            }
            await visitLog.save();


            const logInfo: any = await checkOutServices(new Types.ObjectId(guestId))

            const message = `Hello ${logInfo.user_id.host_firstname} ${logInfo.user_id.host_lastname}, 
    ${logInfo.guest_id.first_name} ${logInfo.guest_id.last_name} has just checked out at ${logInfo.sign_out.date} after seeing you.

    Contact Details.
    Email: ${logInfo.guest_id.email}
    Phone: ${logInfo.guest_id.phone}`;

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.MAILOPTIONS_USER,
                    pass: process.env.MAILOPTIONS_PASS
                }
            });

            const mailOptions = {
                from: process.env.MAILOPTIONS_USER,
                to: logInfo.host_id.host_email,
                subject: 'Your guest is leaving',
                text: message
            }

            const info = await transporter.sendMail(mailOptions);
            return apiResponse(201, { message }, "Guest checked out successfully", res);
        } catch (error) {
            return apiErrorResponse(400, "Internal Server Error, Email not sent to host", res)

        }

    } catch (error) {

        return apiErrorResponse(500, "Internal server error", res)
    }
}



const getMonthlyVisits = async (req: Request, res: Response) => {
    try {
        const monthlyVisits = await getMonthlyVisitsServices()
        return apiResponse(201, monthlyVisits, null, res)
    } catch (error) {
        return apiErrorResponse(400, "Internal Server Error", res)
    }
}

export {
    hostVisitorRecords,
    checkOut,
    getMonthlyVisits,
    getliveVisits
}
