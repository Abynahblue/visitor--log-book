import mongoose, {  ObjectId } from "mongoose";

export interface IGuest{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

export type IGuestModel = IGuest & mongoose.Document