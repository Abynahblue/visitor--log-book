import nodemailer from "nodemailer";
import jwt, { sign } from "jsonwebtoken";
import { Response } from "express";
import UserModel from "../models/user.model";
import { IUser, IUserModel } from "../interface/user.interface";
import { apiResponse } from "../utility/apiErrorResponse";



// const generateToken = async (user: IUserModel, res: Response) => {
//     const token = signToken(user._id)
//     const cookieOptions = {
//         //expiresIn: new Date(Date.now() + parseInt(process.env.JWT_COOKIES_EXPIRES_IN!) * 60 * 60 * 1000),
//         httpOnly: true,
//         secure: false
//     }
//     if (process.env.NODE_ENV === "production"){
//         cookieOptions.secure = true
//     }
//     res.cookie("jwt", token, cookieOptions)
//     user.password = undefined

//     return apiResponse(201, {token, user}, "Token generated successfully",res)
//  }

const generateRandomPassword = (): string => {
    let result = "";
    const characters = "0123456789";
    for (let i = 0; i < 7; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        )
    }
    return result
}

const sendConfirmationEmail = async (email: string, confirmationCode: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAILOPTIONS_USER,
            pass: process.env.MAILOPTIONS_PASS
        }
    });

    const mailOptions = {
        from: process.env.MAILOPTIONS_USER,
        to: email,
        subject: 'Amalitech Vilog Password change',
        text: 'Use the confirmation code provided in this email to reset your password'
    }
    try {
        const info = await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Confirmation code could not be sent to email. Error: ', error);

    }
}

const confirmationCode = (): string => {
    let result = "";
    const characters = "0123456789";
    for (let i = 0; i < 4; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        )
    }
    return result
}

export {
    sendConfirmationEmail,
    generateRandomPassword,
    confirmationCode
}