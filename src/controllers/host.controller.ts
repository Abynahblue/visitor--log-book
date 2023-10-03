import { Request, Response } from "express";
import bcrypt from "bcrypt"
import { generateToken } from "../middleware/email";
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import HostModel from "../models/host.model";
import { getAllHostServices, getHostService } from "../services/host.services";
import { generateConfirmationCode, sendConfirmationEmail } from "../middleware/email";



const loginHost = async (req: Request, res: Response) => {
    try {
        const { host_email, password } = req.body;
        if (!host_email || !password)
            return apiErrorResponse(400, "Please provide email and password", res)

        const host = await HostModel.findOne({ email: host_email })
        if (!host && !(await bcrypt.compare(password, host!.password))) {
            return apiErrorResponse(400, 'Invalid credentials', res)
        }
        if (host) {
            const token: string = generateToken(host!._id);
            res.status(200).json({
                hostId: host._id,
                name: `${host.host_firstname} ${host.host_lastname}`,
                email: host.host_email,
                phone: host.host_phone,
                token: token
            })
        }
    } catch (error) {
        console.log(error);
        return apiErrorResponse(500, "Internal Server Error", res)
    }
}

const getConfirmationCode = async (req: Request, res: Response) => {
    try {
        const { host_email } = req.body;
        if (!host_email) {
            return apiErrorResponse(400, 'Email is required to get confirmation code', res)
        }

        const host = await getHostService(host_email)
        if (!host)
            return apiErrorResponse(400, 'Invalid host email', res)

        const confirmationCode = generateConfirmationCode();

        host.confirmationCode = confirmationCode
        await host.save();

        await sendConfirmationEmail(host_email, confirmationCode)
        return apiResponse(201, { code: confirmationCode }, null, res)
    } catch (error) {
        console.log(error);
        return apiErrorResponse(400, 'Internal Server Error', res)
    }
}

const updatePassword = async (req: Request, res: Response) => {
    try {
        const { confirmationCode, password, host_email } = req.body;
        if (!host_email) {
            return apiErrorResponse(400, "Please provide Email one more time to change password", res)
        }
        if (!confirmationCode) {
            return apiErrorResponse(400, "Please provide code sent to email", res)
        }
        const host = await getHostService(host_email)

        if (!host) {
            return apiErrorResponse(400, 'Invalid user data to reset password', res)
        }

        if (confirmationCode !== host.confirmationCode) {
            return apiErrorResponse(400, 'Invalid Confirmation code', res)
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        host.password = hashedPassword
        await host.save();

        const token = generateToken(host._id)
        return apiResponse(201, {id: host._id, token}, null, res)
    } catch (error) {
        console.log(error);

    }
}

const getHosts = async (req: Request, res: Response) => {
    const host = await getAllHostServices();
    if (!host) {
        return apiErrorResponse(400, "Error fetching hosts", res)
    }
    return apiResponse(200, host, null, res)
}

export {
    loginHost,
    getConfirmationCode,
    updatePassword,
    getHosts
}