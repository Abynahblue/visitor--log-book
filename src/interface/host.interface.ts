import mongoose, { Document, Schema } from "mongoose";

export interface IHost{
    host_firstname: string;
    host_lastname: string;
    host_email: string;
    host_phone: string;
    password: string;
    host_company: string;
    confirmationCode: string
}

export type IHostModel = IHost & mongoose.Document