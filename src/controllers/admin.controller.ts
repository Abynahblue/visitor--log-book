import { Request, Response } from "express"
import bcrypt from "bcrypt"
import{v4 as uuidv4} from "uuid"
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import { AdminModel } from "../models/admin.model";
import { IAdmin } from "../interface/admin.interface";
import { createAdminServices, getAdminService } from "../services/admin.services";
import { generateConfirmationCode, generateToken, sendConfirmationEmail } from "../middleware/email";
import HostModel from "../models/host.model";
import nodemailer from "nodemailer";
import { deleteHostServices } from "../services/host.services";

const registerAdmin = async (req: Request, res: Response) => {
    try {
    const { firstName, lastName, email, phone, password, company } = req.body;
        if (!firstName || !lastName || !email || !phone || !password || !company) {
            return apiErrorResponse(400, 'Please provide all required fields',res)
        }
        const adminExists = await AdminModel.findOne({ email: email });
        
        if (adminExists) {
            return apiErrorResponse(400, 'Admin already exists', res)
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        
        const data: IAdmin = {
            firstName,
            lastName,
            email,
            phone,
            password:hashedPassword,
            company
        }
        const newAdmin = await createAdminServices(data)
        await newAdmin.save();

        const token = generateToken(newAdmin._id)

        res.status(201).json({
            admin_id: newAdmin._id,
            name: `${newAdmin.firstName} ${newAdmin.lastName}`,
            email: newAdmin.email,
            phone: newAdmin.phone,
            token
        })
    } catch (error) {
        return apiErrorResponse(500, 'Internal Server Error', res)
    }
}

const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return apiErrorResponse(400, 'Please provide email and password', res)
        
        const admin = await AdminModel.findOne({ email });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return apiErrorResponse(400, 'Invalid Credentials', res)
        }
        const token = generateToken(admin._id);

        res.status(200).json({
            admin_id: admin._id,
            name: `${admin.firstName} ${admin.lastName}`,
            email: admin.email,
            phone: admin.phone,
            token
        })
    } catch (error) {
        return apiErrorResponse(400, 'Internal Server Error', res)
    }
}

const getConfirmationCode = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        if (!email) return apiErrorResponse(400, 'Email is required to get confirmation code', res)
        
        const admin = await getAdminService(email)
        if (!admin) return apiErrorResponse(400, 'Invalid admin email', res)
        
        const confirmationCode = generateConfirmationCode();

        admin.confirmationCode = confirmationCode;
        await admin.save();

        await sendConfirmationEmail(email, confirmationCode)
        return apiResponse(201,{code: confirmationCode}, null, res)
    } catch (error) {
        return apiErrorResponse(500, 'Internal Server Error', res)
    }
}

const updateAdminPassword = async (req: Request, res: Response) => {
    try {
        const { confirmationCode, password, host_email } = req.body;
        if (!host_email) {
            return apiErrorResponse(400, "Please provide Email one more time to change password", res)
        }
        if (!confirmationCode) {
            return apiErrorResponse(400, "Please provide code sent to email", res)
        }
        const admin = await AdminModel.findOne({host_email, confirmationCode: confirmationCode})

        if (!admin) {
            return apiErrorResponse(400, 'Invalid confirmation code', res)
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        admin.password = hashedPassword
        await admin.save();

        const token = generateToken(admin._id)
        return apiResponse(201, {id: admin._id, token}, null, res)
    } catch (error) {
        console.log(error);

    }
}

const registerHost = async (req: Request, res: Response) => {
    const { first_name, last_name, email, host_phone, company } = req.body
    try {
        if (!first_name || !last_name || !email || !host_phone || !company) {
            return apiErrorResponse(400, 'Please add all fields', res)
        }
        const hostExists = await HostModel.findOne({ email });
        if (hostExists) {
            return apiErrorResponse(400, 'Host already exists', res)
        }

        const host_uuid = uuidv4();
        const host = new HostModel({
            host_uuid,
            host_firstname: first_name,
            host_lastname: last_name,
            host_email: email,
            host_phone: host_phone,
            host_company: company
        });
        await host.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILOPTIONS_USER,
                pass: process.env.MAILOPTIONS_PASS
            }
        });
    
        const mailOptions = {
            from: process.env.MAILOPTIONS_USER,
            to:  email,
            subject: 'Amalitech Vilog added you as a Host',
            text: `Hi ${first_name}

            You have been added as a host on the AmaliTech ViLog System. You can log in with your email and password. 
            Your default password is 1234. Please change this to a more secure password.,
            `
        }
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
        } catch (error) {
            console.error('Confirmation code could not be sent to email. Error: ', error);
            
        }
        return apiResponse(201, {
            hostId: host._id,
            name: `${first_name} ${last_name}`,
            email: host.host_email,
            phone: host.host_phone,
            token: generateToken(host._id)}, null, res)
       
    } catch (error) {
        return apiErrorResponse(400, 'Invalid user data', res)
    } 
}

const deleteHost = async (req: Request, res: Response) => {
    const id = req.params._id
    try {
        if (!id) return apiErrorResponse(400, 'Please provide an id', res)
        
        const deletedHost = await deleteHostServices(id)
        if (!deletedHost) {
            return apiErrorResponse(400, `Host with id: ${id}  does not exist`, res)
        }
        return apiResponse (201, deletedHost,'Host successfully deleted', res)
    } catch (error) {
        return apiErrorResponse(500, 'Internal Server Error',res)
    }
}

export {
    registerAdmin,
    loginAdmin,
    getConfirmationCode,
    updateAdminPassword,
    registerHost,
    deleteHost
}