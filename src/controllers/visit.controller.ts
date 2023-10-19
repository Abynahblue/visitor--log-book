import { Request, Response, request } from "express"
import QRCode from "qrcode"
import catchAsync from "../utility/catchAsync"
import nodemailer from "nodemailer"
import { createGuestServices, getGuestByEmailService, getGuestService } from "../services/guest.services"
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse"
import { userResponses } from "../constants/guest.constants"
import { checkOutServices, getAllVisitLogsServices, getMonthlyVisitsServices, hostVisitsService } from "../services/visit.services"
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

const setAppointment = async (req: Request, res: Response) => {

    const userId = req.params.id
    let { email, guestdata, meetingDetails } = req.body;
    try {
        const user = await getUserByIDService(userId)

        if (!user) return apiErrorResponse(400, "User does not exist", res)


        const guest: any = await getGuestByEmailService(email)
        if (!guest) {
            await GuestModel.create(guestdata)
        }

        const meetingDetails = {
            Date: req.body.meetingDetails.Date,
            Time: req.body.meetingDetails.Time,
            Location: req.body.meetingDetails.Location,
            agenda: req.body.meetingDetails.agenda,
            Organizer: `${user.fullName}`
        };

        const dataImage = await QRCode.toDataURL(JSON.stringify({ meetingDetails }))
        guest.qrCode = dataImage
        await guest.save();

        const message = `Hello ${guest.first_name} ${guest.last_name}, You have an appointment with
    ${user.fullName}   at Amalitech.

    Contact Details.
    Email: ${user.email}
    Phone: ${user.phone}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAILOPTIONS_USER,
                pass: process.env.MAILOPTIONS_PASS
            }
        });

        const mailOptions = {
            from: process.env.MAILOPTIONS_USER,
            to: guest.email,
            subject: 'Please scan QrCode for more information ',
            text: message,
            attachments: [
                {
                    filename: "qr-image.png",
                    path: dataImage
                }
            ]

        }
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return apiResponse(201, { meetingDetails, message }, "Email sent successfully", res)
    } catch (error) {
        return apiErrorResponse(400, "Internal Server error", res)
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
    setAppointment,
    getMonthlyVisits
}
