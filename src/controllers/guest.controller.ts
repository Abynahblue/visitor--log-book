import { Request, Response } from "express";
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import catchAsync from "../utility/catchAsync";
import { createGuestServices, getAllGuestServices, getGuestService } from "../services/guest.services";
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import { userResponses } from "../constants/guest.constants";
import { IGuest, IGuestModel } from "../interface/guest.interface";
import { generateToken, getHashedPassword, passwordIsValid } from "../utility/userUitility";
import { getAllHosts } from "../services/user.services";
import GuestModel from "../models/guest.model";
import { checkInServices } from "../services/visit.services";
import { Types } from "mongoose";
import VisitModel from "../models/visit.model";

const registerGuest = catchAsync(async (req: Request, res: Response) => {
    const { name, email, tel, password, position,company } = req.body;

    try {
        if (!name || !email || !tel ||!password || !position) {
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
        if (guest) {
            await guest.save()
        }
        const guests = await getAllGuestServices()
        const host = await getAllHosts()

        const visitLog = new VisitModel({
            sign_in: new Date(),
            guest_id: guest,
            host_id: host,
            sign_out: {
                status: false,
                date: null
            }
        })
        await visitLog.save();
        const token = generateToken(visitLog._id)

        const logInfo: any = await checkInServices(new Types.ObjectId(guests._id))
        
    
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

    } catch (err) {
        console.log(err);

        return apiErrorResponse(400, "Internal Server Error", res)
    }
})

const login = async (req: Request, res: Response) => {
    try {
        const { email, password, position } = req.body
        if (!email || !password)
            return apiErrorResponse(400, "Please provide email and password", res)

        const user = await GuestModel.findOne({ email }).select("+password")
        if (!user) {
            return apiErrorResponse(400, 'User does not exist', res)
        }
        if (!(await bcrypt.compare(password.trim(), user.password!.trim()))) {
            return apiErrorResponse(400, 'Invalid credentials', res)
       }
        if (user && (await bcrypt.compare(password, user.password!))) {
            const token: string = generateToken(user._id, user.position);
        
            const logInfo: any = await checkInServices(new Types.ObjectId(user.id))


            const message = `Hello ${logInfo.user_id.firstName} ${logInfo.user_id.lastName}, 
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
    

            return apiResponse(201,null , "Guest checked in successfully", res)
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
        const host = await getAllHosts()
        if (!host) return apiErrorResponse(400, 'There is no host matching your search', res)

        return apiResponse(201, host, null, res)
    } catch (error) {
        console.log(error);
        return apiErrorResponse(400, 'Internal Server Error', res)

    }
}

export { registerGuest,login, getAllGuests, getGuest, searchUsers };