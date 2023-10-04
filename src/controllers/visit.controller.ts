import { Request, Response, request } from "express"
import catchAsync from "../utility/catchAsync"
import nodemailer from "nodemailer"
import { getGuestService } from "../services/guest.services"
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse"
import { userResponses } from "../constants/guest.constants"
import { checkInServices, checkOutServices, guestFromLogsService } from "../services/visit.services"
import VisitModel from "../models/visit.model"
import { getHostService } from "../services/host.services"

const checkIn = catchAsync(async (req: Request, res: Response) => {
    const guestId = req.params.id
    const { hostId } = req.body;
    const guest = await getGuestService(guestId)
    if (!guest) return apiErrorResponse(400, userResponses.INVALID_ID, res)

    const guestFromLog = await guestFromLogsService(guestId)
    if (guestFromLog) return apiErrorResponse(400, 'Guest is already signed in', res)
    
    const visitLog = new VisitModel({
        sign_in: new Date(),
        guest_id: guestId,
        host_id: hostId,
        purpose: String
    })
    await visitLog.save();

    const logInfo = await checkInServices(hostId)
    const message = `Hello ${logInfo[0].host_first_name} ${logInfo[0].host_last_name}, 
    ${logInfo[0].guest_first_name} ${logInfo[0].guest_last_name} has just checked in at ${logInfo[0].sign_in} to see you.

    Contact Details.
    Email: ${logInfo[0].email}
    Phone: ${logInfo[0].phone}`;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAILOPTIONS_USER,
            pass: process.env.MAILOPTIONS_PASS
        }
    });

    const mailOptions = {
        from: process.env.MAILOPTIONS_USER,
        to: logInfo[0].host_email,
        subject: 'You have a guest',
        text: message
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.log(error)
        return apiErrorResponse(400, "Internal Server Error, Email not sent to host", res)
        
    }
})

const checkOut = async (req: Request, res: Response) => {
    const { guestId } = req.params;
    const { hostId } = req.body;
    try {
        const guest = await getGuestService(guestId)
        if (!guest) return apiErrorResponse(400, "Invalid user", res)
        
        const host = await getHostService(hostId)
        if(!host) return apiErrorResponse(400, "Host does not exist", res)

        const visitLog = await VisitModel.findOne({
            guest_id: guestId,
            sign_in: { $ne: null },
            sign_out: null
        })
        if (!visitLog) return apiErrorResponse(400, " Visitor is not signed in", res)
        
        visitLog.sign_out = new Date();
        await visitLog.save();

        
    const logInfo = await checkOutServices(hostId)
    const message = `Hello ${logInfo[0].host_first_name} ${logInfo[0].host_last_name}, 
    ${logInfo[0].guest_first_name} ${logInfo[0].guest_last_name} has just checked out at ${logInfo[0].sign_out} after seeing you.

    Contact Details.
    Email: ${logInfo[0].email}
    Phone: ${logInfo[0].phone}`;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAILOPTIONS_USER,
            pass: process.env.MAILOPTIONS_PASS
        }
    });

    const mailOptions = {
        from: process.env.MAILOPTIONS_USER,
        to: logInfo[0].host_email,
        subject: 'Your guest is leaving',
        text: message
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.log(error)
        return apiErrorResponse(400, "Internal Server Error, Email not sent to host", res)
        
    }

    } catch (error) {
        console.log(error);

        return apiErrorResponse(500,"Internal server error", res)
    }
}

export {
    checkIn,
    checkOut
}
