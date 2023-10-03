import mongoose, { Document, Schema } from "mongoose"

export interface IAdmin {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    company: string;
    confirmationCode?: string; 
}

export type IAdminModel = IAdmin & mongoose.Document