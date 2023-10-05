import { Request, Response, request } from "express"
import  QRCode  from "qrcode"
import catchAsync from "../utility/catchAsync"
import nodemailer from "nodemailer"
import { createGuestServices, getGuestService } from "../services/guest.services"
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse"
import { userResponses } from "../constants/guest.constants"
import { checkInServices, checkOutServices, guestFromLogsService, setAppointmentServices } from "../services/visit.services"
import VisitModel from "../models/visit.model"
import { getHostService } from "../services/host.services"
import { Types } from "mongoose"
import { generateToken } from "../middleware/email"
import GuestModel from "../models/guest.model"

const checkIn = catchAsync(async (req: Request, res: Response) => {
    try{
    const guestId = req.params.id
    const { hostId } = req.body;
    const guest = await getGuestService(guestId)
    if (!guest) return apiErrorResponse(400, userResponses.INVALID_ID, res)

    const guestFromLog = await guestFromLogsService(guestId)
    //console.log(guestFromLog);
    
    if (guestFromLog) return apiErrorResponse(400, 'Guest is already signed in', res)
    
    const visitLog = new VisitModel({
        sign_in: new Date(),
        guest_id: guestId,
        host_id: hostId,
        sign_out: {
            status: false,
            date: null
        }
    })
        await visitLog.save();
        const token = generateToken(visitLog._id)

    const logInfo: any = await checkInServices(new Types.ObjectId(guestId))
    

    const message = `Hello ${logInfo.host_id.host_firstname} ${logInfo.host_id.host_lastname}, 
    ${logInfo.guest_id.first_name} ${logInfo.guest_id.last_name} has just checked in at ${logInfo.sign_in} to see you.
    
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
        subject: 'You have a guest',
        text: message
    }
    
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);

        return apiResponse(201, { visitLog, token }, "check in succesful", res);
    } catch (error) {
        console.log(error)
        return apiErrorResponse(400, "Internal Server Error, Email not sent to host", res)
        
    }
})

const checkOut = async (req: Request, res: Response) => {
    try{
        console.log(req.params.id);
        const guestId = req.params.id;
        
    try {
        const guest = await getGuestService(guestId)
        console.log(guest);
        
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
        
    const message = `Hello ${logInfo.host_id.host_firstname} ${logInfo.host_id.host_lastname}, 
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
        console.log('Email sent: ' + info.response);
        return apiResponse(201, { message }, "Guest checked out successfully", res);
    } catch (error) {
        console.log(error)
        return apiErrorResponse(400, "Internal Server Error, Email not sent to host", res)
        
    }

    } catch (error) {
        console.log(error);

        return apiErrorResponse(500,"Internal server error", res)
    }
}

const setAppointment = async (req: Request, res: Response) => {
    console.log(req.params.id);
    
    const hostId = req.params.id
    const {guest_id, guestdata } = req.body;
    try {
        const host = await getHostService(hostId)
        console.log(host);
        
        if (!host) return apiErrorResponse(400, "Host does not exist", res)
        
        let guest = await GuestModel.findOne({ guest_id });
        console.log(guest);
        
        if (!guest) {
            guest = await GuestModel.create(guestdata)
            await guest.save();
        }
        const hostGuest = new VisitModel({
            sign_in: new Date(),
            guest_id: guest_id,
            host_id: hostId,
            sign_out: {
                status: false,
                date: null
            }
        })
        await hostGuest.save();

        const dataImage = await QRCode.toDataURL(JSON.stringify({ guest_id }))
        guest.qrCode = dataImage
        await guest.save();

        const logInfo: any = await setAppointmentServices(new Types.ObjectId(hostId))
        console.log(logInfo);
        

        const message = `Hello ${logInfo.guest_id.first_name} ${logInfo.guest_id.last_name}, You have a meeting with
    ${logInfo.host_id.host_firstname} ${logInfo.host_id.host_lastname}  at 9:00am at ${logInfo.host_id.host_company}.

    Contact Details.
    Email: ${logInfo.host_id.host_email}
    Phone: ${logInfo.host_id.host_phone}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAILOPTIONS_USER,
                pass: process.env.MAILOPTIONS_PASS
            }
        });
    
        const mailOptions = {
            from: process.env.MAILOPTIONS_USER,
            to:  logInfo.guest_id.email,
            subject: 'You have an appointment ',
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
        return apiResponse(201, { hostGuest, message }, "Email sent successfully", res)
        } catch (error) {
            console.error( error);
            return apiErrorResponse(400, "Internal Server error", res)
        }
    } 

export {
    checkIn,
    checkOut,
    setAppointment
}
