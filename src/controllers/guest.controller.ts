import { Request, Response } from "express";
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import catchAsync from "../utility/catchAsync";
import { createGuestServices, getAllGuestServices, getGuestService } from "../services/guest.services";
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import { IGuest, IGuestModel } from "../interface/guest.interface";
import { generateToken, getHashedPassword, passwordIsValid } from "../utility/userUitility";
import {  getAllHostsServices, getAllHostsServicesById, getUserByIdService } from "../services/user.services";
import GuestModel from "../models/guest.model";
import { checkInServices } from "../services/visit.services";
import { Types } from "mongoose";
import VisitModel from "../models/visit.model";

const registerGuest = catchAsync(async (req: Request, res: Response) => {
    const { name, email, tel, password, position, company ,host} = req.body;
   // console.log(req.body);
    

    try {
        if (!name || !email || !tel ||!password || !position ||!host) {
            return apiErrorResponse(400, "Please add all fields!", res)
        }
        if (passwordIsValid(password)) {
            return apiErrorResponse(400, "Invalid password, please enter a valid password", res)
        }

        const hashedPassword = await getHashedPassword(password);

        const data: IGuest = {
            fullName: name ,
            email,
            phone: tel,
            password: hashedPassword,
            position,
            company
        }
        const guest = await createGuestServices(data)
        //console.log(guest);
        
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
            console.log('Email sent: ' + info.response);
    
            return apiResponse(201, { visitLog, token }, "check in succesful", res);
        

    } catch (err) {
        console.log(err);

        return apiErrorResponse(400, "Internal Server Error", res)
    }
})

const login = async (req: Request, res: Response) => {
    try {
        const { email, password, position, host } = req.body
        if (!email || !password ||!host)
            return apiErrorResponse(400, "Please provide email and password", res)

        const guest = await GuestModel.findOne({ email }).select("+password")
        if (!guest) {
            return apiErrorResponse(400, 'Guest does not exist', res)
        }
        if (!(await bcrypt.compare(password.trim(), guest.password!.trim()))) {
            return apiErrorResponse(400, 'Invalid credentials', res)
       }
        if (guest && (await bcrypt.compare(password, guest.password!))) {
        
        
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
            console.log('Email sent: ' + info.response);
        
            return apiResponse(201, { visitLog, token }, "check in successful", res);
        }
    
           
    } catch (error) {
        console.log(error);
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
        console.log(error);
        return apiErrorResponse(500, 'Internal Server', res)
    }
}




// const checkOut = catchAsync(async (req: Request, res: Response) => {
//     const guestId = req.params.id
//     const guest = await getGuestService(guestId)
//     if (!guest) return apiErrorResponse(400, userResponses.INVALID_ID, res)
//     guest.checkOutTime = new Date()
//     await guest.save();
//     return apiResponse(200, guest, "Guest check-out successful.", res)
// })

const getAllGuests = catchAsync(async (req: Request, res: Response,) => {
    const guests = await getAllGuestServices();
    if (!guests) return apiErrorResponse(400, "Error fetching guests", res)
    return apiResponse(200, guests, null, res)
})

const searchUsers = async (req: Request, res: Response) => {
    try {
        const host = await getAllHostsServices()
        if (!host) return apiErrorResponse(400, 'There is no host matching your search', res)

        return apiResponse(201, host, null, res)
    } catch (error) {
        console.log(error);
        return apiErrorResponse(400, 'Internal Server Error', res)

    }
}



export {
    registerGuest,
    login,
    getAllGuests,
    getGuest,
    searchUsers,
};