import { sign } from 'jsonwebtoken';
import { Request, Response } from "express";
import bcrypt from "bcrypt"
import QRCode from "qrcode"
import nodemailer from "nodemailer"
import catchAsync from "../utility/catchAsync";
import { createGuestServices, getAllGuestServices, getGuestByIdService, getGuestService, updateGuestServices } from "../services/guest.services";
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import { IGuest, IGuestModel } from "../interface/guest.interface";
import { generateToken, getHashedPassword, passwordIsValid } from "../utility/userUitility";
import { getAllHostsServices, getAllHostsServicesById, getAllUserServices, getLoggedInUsers, getUserByIdService, getUserServices } from "../services/user.services";
import GuestModel from "../models/guest.model";
import { guestFromLogsService, hostVisitsService } from "../services/visit.services";
import mongoose, { Types } from "mongoose";
import VisitModel from "../models/visit.model";
import { userResponses } from "../constants/guest.constants";
import { IVisit } from "../interface/visit.interface";
import { getAllUsers } from "./user.controller";
import { hostVisitorRecords } from "./visit.controller";
import { CustomExpressRequest } from "../types";

const registerGuest = catchAsync(async (req: Request, res: Response) => {
    const { name, email, tel, password, company, hostEmail } = req.body;

    console.log(req.body);

    try {
        if (!name || !email || !tel || !password || !hostEmail) {
            return apiErrorResponse(400, "Please add all fields!", res)
        }
        if (passwordIsValid(password)) {
            return apiErrorResponse(400, "Invalid password, please enter a valid password", res)
        }

        const domains = ["amalitech.com", "amalitech.org"]
        const hostDomain = hostEmail.split("@")[1]
        const isAmalitechEmail = domains.includes(hostDomain)


        if (!isAmalitechEmail) {
            return apiErrorResponse(400, "Invalid host email. Please provide a valid email", res)
        }
        const [firstName, lastName] = hostEmail.split("@")[0].split(".");

        const hashedPassword = await getHashedPassword(password);

        const data: IGuest = {
            fullName: name,
            email,
            phone: tel,
            password: hashedPassword,
            company
        }
        const guest = await createGuestServices(data)

        if (!guest) {
            return apiErrorResponse(400, "Failed to create guest", res)
        }

        const visitLog = new VisitModel({
            sign_in: new Date(),
            guest_id: guest._id,
            hostEmail: hostEmail,
            sign_out: {
                status: false,
                date: null
            }
        })
        await visitLog.save();
        const token = generateToken(visitLog._id)


        const message = `Hello ${firstName} ${lastName}, 
        ${guest.fullName}  has just checked in at ${visitLog.sign_in} to see you.
        
        Contact Details.
        Email: ${guest.email}
        Phone: ${guest.phone}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAILOPTIONS_USER,
                pass: process.env.MAILOPTIONS_PASS
            }
        });

        const mailOptions = {
            from: process.env.MAILOPTIONS_USER,
            to: hostEmail,
            subject: 'You have a guest',
            text: message
        }

        const infoHost = await transporter.sendMail(mailOptions);

        const qrCode = JSON.stringify({ visitLogId: visitLog._id });
        const dataImage: any = await QRCode.toDataURL(qrCode);

        const emailOptions = {
            from: process.env.MAILOPTIONS_USER,
            to: guest.email,
            subject: 'Here is your  QR code for logout',
            text: `Hi ${guest.fullName}
            
            Use the QR code in this email to check out.`,
            attachments: [
                {
                    filename: "qr-image.png",
                    path: dataImage
                }
            ]
        }
        const infoGuest = await transporter.sendMail(emailOptions);
        return apiResponse(201, { visitLog, token, visitLogId: visitLog._id }, "check in successful", res);


    } catch (err) {
        console.log(err);

        return apiErrorResponse(400, "Internal Server Error", res)
    }
})

const login = async (req: Request, res: Response) => {
    try {
        const { email, password, position, hostEmail } = req.body
        if (!email || !password || !hostEmail)
            return apiErrorResponse(400, "Please provide email and password", res)

        const guest = await GuestModel.findOne({ email }).select("+password")
        if (!guest) {
            return apiErrorResponse(400, 'Guest does not exist', res)
        }


        const domains = ["amalitech.com", "amalitech.org"]
        const hostDomain = hostEmail.split("@")[1]
        const isAmalitechEmail = domains.includes(hostDomain)
        if (!isAmalitechEmail) {
            return apiErrorResponse(400, "Invalid host email. Please provide a valid email", res)
        }
        const [FirstName, lastName] = hostEmail.split("@")[0].split(".");

        const passwordCheck = password === guest.password ? false : !(bcrypt.compareSync(password.trim(), guest.password!.trim()));
        if (passwordCheck) {

            return apiErrorResponse(400, 'Invalid credentials', res)
        }
        if (guest && ((await bcrypt.compare(password
            , guest.password!)) || password === guest.password!)) {



            const visitLog = new VisitModel({
                sign_in: new Date(),
                guest_id: guest._id,
                hostEmail: hostEmail,
                sign_out: {
                    status: false,
                    date: null
                }
            })
            await visitLog.save();
            //const token = generateToken(visitLog._id)

            //const visitId = await VisitModel.findOne({_id:visitLog._id}).populate('guest_id user_id')

            const message = `Hello ${FirstName} ${lastName} , 
            ${guest.fullName}  has just checked in at ${visitLog.sign_in} to see you.
            
            Contact Details.
            Email: ${guest.email}
            Phone: ${guest.phone}`;

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.MAILOPTIONS_USER,
                    pass: process.env.MAILOPTIONS_PASS
                }
            });

            const mailOptions = {
                from: process.env.MAILOPTIONS_USER,
                to: hostEmail,
                subject: 'You have a guest',
                text: message
            }

            const infoHost = await transporter.sendMail(mailOptions);

            const qrCode = JSON.stringify({ visitLogId: visitLog._id })
            const dataImage: any = await QRCode.toDataURL(qrCode);

            const emailOptions = {
                from: process.env.MAILOPTIONS_USER,
                to: guest.email,
                subject: 'Here is your  QR code for logout',
                text: `Hi ${guest.fullName}
                
                Use the QR code in this email to check out.`,
                attachments: [
                    {
                        filename: "qr-image.png",
                        path: dataImage
                    }
                ]
            }
            const infoGuest = await transporter.sendMail(emailOptions);

            return apiResponse(201, { visitLog }, "check in successful", res);
        }

    } catch (error) {
        return apiErrorResponse(500, "Internal Server Error", res)
    }
}


const getGuest = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const guest = await getGuestService(id)
        if (!id) return apiErrorResponse(400, 'Host does not exist', res)

        return apiResponse(201, guest, null, res)
    } catch (error) {
        return apiErrorResponse(500, 'Internal Server', res)
    }
}

const updateGuest = catchAsync(async (req: Request, res: Response) => {
    const guestId = req.params.id;
    const user = await getGuestByIdService(guestId);
    if (!user) return apiErrorResponse(400, "Invalid Id", res);
    await updateGuestServices(guestId, req.body);
    return apiResponse(200, null, "Guest updated successfully", res);
});


const logout = async (req: Request, res: Response) => {
    try {
        const { visitLogId } = req.body;
        const visitLog: any = await guestFromLogsService(visitLogId)

        if (!visitLog) {
            return apiErrorResponse(400, "Visit log not found", res)
        }
        visitLog.sign_out = {
            ...visitLog.sign_out,
            status: true,
            date: new Date()
        }
        await visitLog.save()

        const admins: any = await getLoggedInUsers();

        if (admins.length === 0) {
            const admin: any = await getUserServices()
            if (admin) {
                const message = `Hello ${admin.fullName}
            
            ${visitLog.guest_id.fullName} has logged  out`

                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.MAILOPTIONS_USER,
                        pass: process.env.MAILOPTIONS_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.MAILOPTIONS_USER,
                    to: admin.email,
                    subject: 'Guest checkout notification',
                    text: message
                }
                const info = await transporter.sendMail(mailOptions)
            }
        }
        admins.forEach(async (admin: any) => {

            const message = `Hello ${admin.fullName}
            
            ${visitLog.guest_id.fullName} has logged  out`

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.MAILOPTIONS_USER,
                    pass: process.env.MAILOPTIONS_PASS
                }
            });

            const mailOptions = {
                from: process.env.MAILOPTIONS_USER,
                to: admin.email,
                subject: 'Guest checkout notification',
                text: message
            }
            const info = await transporter.sendMail(mailOptions)
        })

        return apiResponse(200, visitLogId, "logout successful, See you again", res);
    } catch (err) {
        return apiErrorResponse(400, "Internal Server error", res)
    }
}

const getAllGuests = catchAsync(async (req: Request, res: Response,) => {
    const guests = await getAllGuestServices();
    if (!guests) return apiErrorResponse(400, "Error fetching guests", res)
    return apiResponse(200, guests, null, res)
})

const searchUsers = async (req: Request, res: Response) => {
    try {
        const host = await getAllUserServices()
        if (!host) return apiErrorResponse(400, 'There is no host matching your search', res)

        return apiResponse(201, host, null, res)
    } catch (error) {
        return apiErrorResponse(400, 'Internal Server Error', res)

    }
}

const getHostGuests = async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        const visits: any = await hostVisitsService(userId)

        if (!visits || visits.length === 0) {
            return apiErrorResponse(400, "No guests found for the user", res)
        }
        return apiResponse(200, visits, null, res)
    } catch (error) {
        return apiErrorResponse(500, "Internal Server error", res)
    }
}


export {
    registerGuest,
    login,
    getAllGuests,
    getGuest,
    searchUsers,
    logout,
    getHostGuests,
    updateGuest
};