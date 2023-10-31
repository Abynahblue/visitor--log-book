import { Request, Response, application } from "express";
import QRCode from "qrcode"
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import GuestModel from "../models/guest.model";
import { getGuestByEmailService, getGuestService, getGuestWithQrCodeServices } from "../services/guest.services";
import nodemailer from "nodemailer"
import { confirmationCode } from "../middleware/email";
import { Crypto } from "../utility/userUitility";
import { IGuestModel } from "../interface/guest.interface";
const uuidv4 = require('uuid').v4

const confirmHostEmail = async (req: Request, res: Response) => {
    try {
        const { hostEmail } = req.body

        const domains = ["amalitech.com", "amalitech.org"]
        const hostDomain = hostEmail.split("@")[1]
        const isAmalitechEmail = domains.includes(hostDomain)
        if (!isAmalitechEmail) {
            return apiErrorResponse(400, "Invalid host email. Please provide a valid email", res)
        }

        const generatedCode = confirmationCode();
        const crypto = new Crypto();
        const code = crypto.encryptText(generatedCode);

        const [FirstName, lastName] = hostEmail.split("@")[0].split(".");

        const message = `Hello ${FirstName} ${lastName} , 
        please enter this code ${generatedCode}
        `

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
            subject: 'Confirmation Code',
            text: message
        }

        const infoHost = await transporter.sendMail(mailOptions);
        return apiResponse(201, code, "code sent successfully.", res);

    } catch (err) {
        return apiErrorResponse(400, "Internal Server error", res)
    }
}

const verifyCode = async (req: Request, res: Response) => {
    try {
        const { code, generatedCode } = req.body;
        const crypto = new Crypto();
        const decryptedCode = crypto.decryptText(code);

        if (decryptedCode !== generatedCode) {
            return apiErrorResponse(400, "Invalid verification code. Please try again", res)
        }
        return apiResponse(200, null, "Code verified successfully.", res)
    } catch (err) {
        return apiErrorResponse(400, "Internal Server error", res)
    }
}

const setAppointment = async (req: Request, res: Response) => {

    let { hostEmail, email: guestEmail } = req.body;
    try {

        const guest = await getGuestByEmailService(guestEmail, "+password")

        if (!guest) return apiErrorResponse(400, "No guest was found", res)

        const uuid = uuidv4()

        const { email, password, } = guest
        const qrCode = JSON.stringify({ uuid, email, password, hostEmail });
        const dataImage: any = await QRCode.toDataURL(qrCode);

        if (!guest.qrCodeId) {
            guest.qrCodeId = {
                host: "",
                admin: ""
            };
        } else {
        }

        guest.qrCodeId.host = uuid
        await guest.save();


        //  res.cookie("id", uuid, { httpOnly: true, secure: true });


        const [FirstName, lastName] = hostEmail.split("@")[0].split(".");
        const guestInfo = await getGuestService(guest._id)

        const message = `Hello ${guestInfo?.fullName}, You have an appointment with
    ${FirstName} ${lastName}  at Amalitech.

    Contact Details.
    Email: ${hostEmail}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAILOPTIONS_USER,
                pass: process.env.MAILOPTIONS_PASS
            }
        });

        const mailOptions = {
            from: process.env.MAILOPTIONS_USER,
            to: guest.email,
            subject: 'Please scan QrCode for more information ',
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
        return apiResponse(201, { qrCodeId: uuid, message: "Qrcode generated successfully and sent to guest email" }, "", res)
    } catch (error) {
        console.log(error);
        return apiErrorResponse(400, "Internal Server error", res)
    }
}

const generateQrCode = async (req: Request, res: Response) => {
    try {
        const { email: guestEmail } = req.body;

        const guest = await getGuestByEmailService(guestEmail, "+password")

        if (!guest) return apiErrorResponse(400, "No guest was found", res)

        const uuid = uuidv4()
        const { email, password } = guest
        const qrCode = JSON.stringify({ uuid, email, password });
        const dataImage: any = await QRCode.toDataURL(qrCode);

        if (!guest.qrCodeId) {
            guest.qrCodeId = {
                host: null,
                admin: null
            };
        }
        guest.qrCodeId.admin = uuid
        await guest.save()

        //res.cookie("id", uuid, { httpOnly: true, secure: true });

        const guestInfo = await getGuestService(guest._id)

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAILOPTIONS_USER,
                pass: process.env.MAILOPTIONS_PASS
            }
        });

        const mailOptions = {
            from: process.env.MAILOPTIONS_USER,
            to: guestInfo?.email,
            subject: 'QR Code for your next check-in at AmaliTech',
            text: `Hi ${guestInfo?.fullName}

            Use the QR code in this email to check in on your next visit.`,
            attachments: [
                {
                    filename: "qr-image.png",
                    path: dataImage
                }
            ]
        }
        const info = await transporter.sendMail(mailOptions);

        return apiResponse(201, { qrCodeId: dataImage, message: "Qrcode generated successfully and sent to guest email" }, '', res);
    } catch (error) {


        return apiErrorResponse(500, "internal server error", res)
    }
}

const loginWithQRCode = async (req: Request, res: Response) => {
    try {
        const { uuid, email, password } = req.body

        if (!email || !password) return apiErrorResponse(400, " Email and password are required from the qrcode", res)

        const guest = await GuestModel.findOneAndUpdate({ uuid, email, password });
        if (!guest) return apiErrorResponse(400, "Guest not found", res)
        if (guest.qrCodeId?.host) {
            guest.qrCodeId.host = "";
            await guest.save()
            return apiResponse(200, { guest }, "Login successful", res)
        }
        return apiErrorResponse(400, "Invalid QR code", res)
    } catch (error) {
        return apiErrorResponse(500, "Internal Server Error", res)
    }
}

export {
    confirmHostEmail,
    verifyCode,
    setAppointment,
    generateQrCode,
    loginWithQRCode
}