import mongoose, { model, Schema, Types } from "mongoose";
import { IGuest, IGuestModel } from "../interface/guest.interface";

const guestSchema = new Schema<IGuest>(
    {
        fullName: String,
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: String,
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false
        },
        position: {
            type: String,
            enum: ["visitor", "contractor"],
            required: true
        },
        user: {
            type: String,
            ref: "User"
        },
        qrCode: {
            type: String,
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