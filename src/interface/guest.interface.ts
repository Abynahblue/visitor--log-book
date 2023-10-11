import mongoose, {  ObjectId } from "mongoose";

export interface IGuest{
    fullName: string;
    email: string;
    phone: string;
    password: string;
    company?: string;
    position: string;
    qrCode?: string;
    isQrCodeDisabled?: boolean,
}

export type IGuestModel = IGuest & mongoose.Document