import mongoose, {model, Schema, Types } from "mongoose";
import { IGuest, IGuestModel } from "../interface/guest.interface";

const guestSchema = new Schema<IGuest>(
    {
        first_name: String,
        last_name: String,
        email: String,
        phone: String,
        qrCode: {
            type: String
        },
        isQrCodeDisabled: {
            type: Boolean, 
            default: false
        },
    },
    
    { timestamps: true }
);
const GuestModel = model<IGuestModel>("Guest", guestSchema)

export default GuestModel;