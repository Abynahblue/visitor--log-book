import { Request, Response } from "express";
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken";
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import UserModel from "../models/user.model";
import { createUserServices, getUserByIdService, getUserService, updateUserServices } from "../services/user.services";
import { IUser } from "../interface/user.interface";
import { CustomExpressRequest, DecodedToken } from "../types";
import { generateToken, getHashedPassword, passwordIsValid } from "../utility/userUitility";
import { generateRandomPassword } from "../middleware/email";

const createUser = async (req: Request, res: Response) => {
    try {


        const { fullName, email, phone, position } = req.body;
        if (!fullName || !email || !phone || !position) {
            return apiErrorResponse(400, 'Please provide all required fields', res)
        }
        const userExists = await UserModel.findOne({ email: email });

        if (userExists) {
            return apiErrorResponse(400, 'User already exists', res)
        }
        const randomPassword = generateRandomPassword()
        const hashedPassword = await bcrypt.hash(randomPassword, 10)

        const data: IUser = {
            fullName,
            email,
            phone,
            password: hashedPassword,
            role: position,
            loggedIn: false
        }
        const newUser = await createUserServices(data)
        await newUser.save();


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
            subject: `Amalitech Vilog added you as a ${newUser.role}`,
            text: `Hi ${newUser.fullName}

            You have been added as a ${newUser.role} on the AmaliTech ViLog System. You can log in with your email and password. 
            Your default password is ${randomPassword}. Please change this to a more secure password.,

            To update your password, click on the following link:
            http://localhost:5010/api/v1/user/${newUser.id}

            `
        }
        try {
            const info = await transporter.sendMail(mailOptions);
        } catch (error) {
            return apiErrorResponse(500, "Internal Server error", res)
        }

        res.status(201).json({
            user_id: newUser._id,
            name: `${newUser.fullName}`,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role
        })
    } catch (error) {
        return apiErrorResponse(500, 'Internal Server Error', res)
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const { userEmail, password } = req.body
        if (!userEmail || !password)
            return apiErrorResponse(400, "Please provide email and password", res)

        const user = await UserModel.findOne({ email: userEmail }).select("+password")

        if (!user) {
            return apiErrorResponse(400, 'User does not exist', res)
        }
        if (!(await bcrypt.compare(password.trim(), user.password!.trim()))) {
            return apiErrorResponse(400, 'Invalid credentials', res)
        }
        if (user && (await bcrypt.compare(password, user.password!))) {

            user.loggedIn = true
            await user.save();

            const token: string = generateToken(user._id, user.role);

            return apiResponse(200, { token }, "Logged in", res)
        }

    } catch (error) {
        return apiErrorResponse(500, "Internal Server Error", res)
    }
}

// const adminLogin = async (req: Request, res: Response) => {
//     try {

//         const { userEmail, password } = req.body
//         if (!userEmail || !password)
//             return apiErrorResponse(400, "Please provide email and password", res)

//         const user = await UserModel.findOne({ email: userEmail }).select("+password")
//         if (!user) {
//             return apiErrorResponse(400, 'User does not exist', res)
//         }
//         if (!(await bcrypt.compare(password.trim(), user.password!.trim()))) {
//             return apiErrorResponse(400, 'Invalid credentials', res)
//         }

//         if (user && (await bcrypt.compare(password, user.password!))) {
//             const token: string = generateToken(user._id, user.role);

//             return apiResponse(201, null, "Logged in", res);
//         }
//     } catch (error) {
//         return apiErrorResponse(500, "Internal Server Error", res)
//     }
// }

const updatePassword = async (req: Request, res: Response,) => {
    const { newPassword, oldPassword } = req.body;
    const user = await UserModel.findById((req as CustomExpressRequest).currentUserId).select('+password')

    if (!(user && await bcrypt.compare(oldPassword, user!.password))) {
        return apiErrorResponse(400, "Incorrect password", res)
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword;
    user.save();
    return apiResponse(200, null, "Password updated successfully", res)
}


const initiateForgotPasswordreset = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        if (!email) return apiErrorResponse(400, 'Email is required to reset password', res)

        const user = await getUserService(email)
        if (!user) return apiErrorResponse(400, 'Invalid email', res)

        // const userProfile = await ProfileModel.findOne({ userId: user.id }).populate("userId", "email");
        // if (!userProfile || !userProfile.userId || !userProfile.userId.email) {
        //     return apiErrorResponse(400, 'User profile or email not found', res);
        // }

        const token = generateToken(user.id)

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAILOPTIONS_USER,
                pass: process.env.MAILOPTIONS_PASS
            }
        });

        const mail = {
            from: process.env.MAILOPTIONS_USER,
            to: email,
            subject: 'Amalitech Vilog Password change',
            html: `<p>Reset forgot Password <p> click on the button below
                <a href=http://localhost:5172?token=${token}><button>Update password</button></a> 
            `
        }
        await transporter.sendMail(mail);

        return apiResponse(201, null, "Email sent, check your inbox", res)
    } catch (error) {
        return apiErrorResponse(500, 'Internal Server Error', res)
    }
}

const forgotPasswordreset = async (req: Request, res: Response) => {
    try {
        const { password, confirmPassword, token } = req.body;
        if (!password || !confirmPassword || !token)
            return apiErrorResponse(400, "Please enter new password and password confirm to reset password", res)
        if (passwordIsValid(password)) {
            return apiErrorResponse(400, "Invalid password, please enter a valid password", res)
        }
        if (password !== confirmPassword) {
            return apiErrorResponse(400, "Password mismatch", res)
        }


        const tokenData: any = jwt.verify(token, process.env.JWT_SECRET!)


        let user = await getUserByIdService(tokenData?._id, "+password")

        const passwordMatched = await bcrypt.compare(password, user?.password!);
        if (passwordMatched) {
            return apiErrorResponse(400, "Password already used, Please change password", res)
        }
        const hashedPassword = await getHashedPassword(password);
        user = await updateUserServices(user?.id, {
            password: hashedPassword,
        })

        const accessToken = generateToken(user?._id)

        const resp = { userId: user?.id, userRole: user?.role, accessToken }

        return apiResponse(200, resp, "User updated successfully", res)
    } catch (error) {
        return apiErrorResponse(400, "Internal Server error", res)
    }

}

export {
    createUser,
    login,
    // adminLogin,
    updatePassword,
    initiateForgotPasswordreset,
    forgotPasswordreset
}
