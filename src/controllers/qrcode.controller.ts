import { Request, Response } from "express";
import QRCode from "qrcode"
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import GuestModel from "../models/guest.model";
import { getGuestService } from "../services/guest.services";
import nodemailer from "nodemailer"

const generateQrCode = async (req: Request, res: Response) => {
    try {
        const { guest_id } = req.body;
        if ( !guest_id) return apiErrorResponse(400, "Id is required", res)
      
        const guest = await GuestModel.findById( guest_id );
        console.log(guest);
        
        if (!guest) return apiErrorResponse(400, "No guest was found", res)
        const dataImage: any = await QRCode.toDataURL(JSON.stringify({guest}))
        console.log(dataImage);
        
        guest.qrCode = dataImage
            await guest.save()
            
        
            const guestInfo = await getGuestService(guest_id)
        console.log(guestInfo);
        
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAILOPTIONS_USER,
                pass: process.env.MAILOPTIONS_PASS
            }
        });
    
        const mailOptions = {
            from: process.env.MAILOPTIONS_USER,
            to:  guestInfo?.email,
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
        console.log('Email sent: ' + info.response);

        return apiResponse(201, null, "Qrcode generated successfully, check your email", res)
        } catch (error) {
            console.error('Confirmation code could not be sent to email. Error: ', error);
            return apiErrorResponse(500, "internal server error", res)
        }
}
    

export default generateQrCode;