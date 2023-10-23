import { Request, Response } from "express";
import QRCode from "qrcode"
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import GuestModel from "../models/guest.model";
import { getGuestByEmailService, getGuestService, getGuestWithQrCodeServices } from "../services/guest.services";
import nodemailer from "nodemailer"

const generateQrCode = async (req: Request, res: Response) => {
    try {
        const { hostEmail, email: guestEmail } = req.body;
        if (!guestEmail) return apiErrorResponse(400, "Id is required", res)

        const domains = ["amalitech.com", "amalitech.org"]
        const hostDomain = hostEmail.split("@")[1]
        const isAmalitechEmail = domains.includes(hostDomain)
        if (!isAmalitechEmail) {
            return apiErrorResponse(400, "Invalid host email. Please provide a valid email", res)
        }

        const guest = await getGuestByEmailService(guestEmail, "+password")

        if (!guest) return apiErrorResponse(400, "No guest was found", res)

        const { email, password } = guest
        const qrCode = JSON.stringify({ email, password, hostEmail });
        const dataImage: any = await QRCode.toDataURL(qrCode);

        guest.qrCode = dataImage
        await guest.save()

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

        return apiResponse(201, { qrCode: dataImage, message: "Qrcode generated successfully and sent to guest email" }, '', res);
    } catch (error) {
        return apiErrorResponse(500, "internal server error", res)
    }
}

const loginWithQRCode = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) return apiErrorResponse(400, " Email and password are required the qrcode", res)

        const guest = await GuestModel.findOne({ email, password });
        if (!guest) return apiErrorResponse(400, "Guest not found", res)

        return apiResponse(200, { guest }, "Login successful", res)
    } catch (error) {
        return apiErrorResponse(500, "Internal Server Error", res)
    }
}

export {
    generateQrCode,
    loginWithQRCode
}