import {model, Schema, Types } from "mongoose";
import { IGuest, IGuestModel } from "../interface/guest.interface";

const guestSchema = new Schema<IGuest>(
    {
        first_name: String,
        last_name: String,
        email: String,
        phone: String,
        purpose: String,
        checkInTime: Date,
        checkOutTime: Date
    },
    
    { timestamps: true }
);
const GuestModel = model<IGuestModel>("Guest", guestSchema)

export default GuestModel;