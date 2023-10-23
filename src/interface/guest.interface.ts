import mongoose, { ObjectId } from "mongoose";

export interface IGuest {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    company?: string;
    user?: mongoose.Types.ObjectId;
    qrCode?: string;
    isQrCodeDisabled?: boolean,
}

export type IGuestModel = IGuest & mongoose.Document