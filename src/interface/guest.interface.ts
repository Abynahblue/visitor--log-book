import mongoose, {  ObjectId } from "mongoose";

export interface IGuest{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    qrCode: string;
    isQrCodeDisabled: boolean,
}

export type IGuestModel = IGuest & mongoose.Document