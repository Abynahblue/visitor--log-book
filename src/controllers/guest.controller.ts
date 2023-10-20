import { Request, Response } from "express";
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import catchAsync from "../utility/catchAsync";
import { createGuestServices, getAllGuestServices, getGuestService } from "../services/guest.services";
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import { IGuest, IGuestModel } from "../interface/guest.interface";
import { generateToken, getHashedPassword, passwordIsValid } from "../utility/userUitility";
import { getAllHostsServices, getAllHostsServicesById, getAllUserServices, getUserByIdService } from "../services/user.services";
import GuestModel from "../models/guest.model";
import { guestFromLogsService, hostVisitsService } from "../services/visit.services";
import mongoose, { Types } from "mongoose";
import VisitModel from "../models/visit.model";
import { userResponses } from "../constants/guest.constants";
import { IVisit } from "../interface/visit.interface";
import { getAllUsers } from "./user.controller";
import { hostVisitorRecords } from "./visit.controller";

const registerGuest = catchAsync(async (req: Request, res: Response) => {
    const { name, email, tel, password, position, company, host } = req.body;


    try {
        if (!name || !email || !tel || !password || !position || !host) {
            return apiErrorResponse(400, "Please add all fields!", res)
        }
        if (passwordIsValid(password)) {
            return apiErrorResponse(400, "Invalid password, please enter a valid password", res)
        }

        const hashedPassword = await getHashedPassword(password);

        const data: IGuest = {
            fullName: name,
            email,
            phone: tel,
            password: hashedPassword,
            position,
            company
        }
        const guest = await createGuestServices(data)

        if (!guest) {
            return apiErrorResponse(400, "Failed to create guest", res)
        }
        const user = await getUserByIdService(host)

        const visitLog = new VisitModel({
            sign_in: new Date(),
            guest_id: guest._id,
            user_id: user?._id,
            sign_out: {
                status: false,
                date: null
            }
        })
        await visitLog.save();
        const token = generateToken(visitLog._id)


        const message = `Hello ${user?.fullName} , 
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
            to: user?.email,
            subject: 'You have a guest',
            text: message
        }

        const info = await transporter.sendMail(mailOptions);

        return apiResponse(201, { visitLog, token }, "check in succesful", res);


    } catch (err) {

        return apiErrorResponse(400, "Internal Server Error", res)
    }
})

const login = async (req: Request, res: Response) => {
    try {
        const { email, password, position, host } = req.body
        if (!email || !password || !host)
            return apiErrorResponse(400, "Please provide email and password", res)

        const guest = await GuestModel.findOne({ email }).select("+password")
        if (!guest) {
            return apiErrorResponse(400, 'Guest does not exist', res)
        }

        const passwordCheck = password === guest.password ? false : !(bcrypt.compareSync(password.trim(), guest.password!.trim()));
        if (passwordCheck) {

            return apiErrorResponse(400, 'Invalid credentials', res)
        }
        if (guest && ((await bcrypt.compare(password
            , guest.password!)) || password === guest.password!)) {


            const user = await getUserByIdService(host)

            const visitLog = new VisitModel({
                sign_in: new Date(),
                guest_id: guest._id,
                user_id: user?._id,
                sign_out: {
                    status: false,
                    date: null
                }
            })
            await visitLog.save();
            const token = generateToken(visitLog._id)

            //const visitId = await VisitModel.findOne({_id:visitLog._id}).populate('guest_id user_id')

            const message = `Hello ${user?.fullName} , 
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
                to: user?.email,
                subject: 'You have a guest',
                text: message
            }

            const info = await transporter.sendMail(mailOptions);

            return apiResponse(201, { visitLog, token }, "check in successful", res);
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




const logout = catchAsync(async (req: Request, res: Response) => {
    const visitLogId = req.body.visitLogId;
    const visitLog = await guestFromLogsService(visitLogId)

    if (!visitLog) {
        return apiErrorResponse(400, "Visit log not found", res)
    }
    visitLog.sign_out = {
        ...visitLog.sign_out,
        status: true,
        date: new Date()
    }
    await visitLog.save()
    return apiResponse(200, visitLog, "Guest check-out successful.", res)
})

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
    getHostGuests
};