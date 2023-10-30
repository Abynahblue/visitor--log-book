import mongoose, { ObjectId } from "mongoose";

interface IQrCodeId {
    host: string | null
    admin: string | null
}

export interface IGuest {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    company?: string;
    qrCodeId?: IQrCodeId;
    isQrCodeDisabled?: boolean,
}

export type IGuestModel = IGuest & mongoose.Document