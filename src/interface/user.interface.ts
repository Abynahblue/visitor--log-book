import mongoose, { Schema, Document } from "mongoose";

export interface IUser {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    company: string;
    role: string;
}

export interface IUserMethods{
    correctPassword(): boolean
}
 
export type IUserModel = IUser & mongoose.Document

