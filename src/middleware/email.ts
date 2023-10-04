import nodemailer from "nodemailer";
import jwt from "jsonwebtoken"
import { Result } from "express-validator";

const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}

const generateConfirmationCode = (): string => {
    let result = "";
    const charcters = "0123456789";
    for (let i = 0; i < 7; i++){
        result += charcters.charAt(
            Math.floor(Math.random() * charcters.length)
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
        text:'User the confirmation code provided in this email to reset your password'
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Confirmation code could not be sent to email. Error: ', error);
        
    }
}

// const sendHostConfirmationEmail = async (host_email: string, confirmationCode: string) => {
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         host: "smtp.gmail.com",
//         port: 587,
//         secure: false,
//         auth: {
//             user: process.env.MAILOPTIONS_USER,
//             pass: process.env.MAILOPTIONS_PASS
//         }
//     });

//     const mailOptions = {
//         from: process.env.MAILOPTIONS_USER,
//         to: host_email,
//         subject: 'Amalitech Vilog added you as a Host',
//         text:'User the confirmation code provided in this email to reset your password'
//     }
//     try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent: ' + info.response);
//     } catch (error) {
//         console.error('Confirmation code could not be sent to email. Error: ', error);
        
//     }
// }

export {
    sendConfirmationEmail,
    generateConfirmationCode,
    generateToken
}