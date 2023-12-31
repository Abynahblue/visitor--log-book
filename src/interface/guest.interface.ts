import mongoose, { ObjectId } from "mongoose";

interface IQrCodeId {
    host: string | null
    admin: string | null
    email?: string | null
    createdAt?: Date
}

export interface IGuest {
    fullName: string;
    email: string;
    phone: string;
    position: string;
    password: string;
    company?: string;
    qrCodeId?: IQrCodeId;
    isQrCodeDisabled?: boolean,
}

export type IGuestModel = IGuest & mongoose.Document