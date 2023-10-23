import mongoose, { Schema, Document } from "mongoose";

export interface IUser {
    _id?: string;
    fullName: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    loggedIn: boolean
}

export interface IUserMethods {
    correctPassword(): boolean
}

export type IUserModel = IUser & mongoose.Document

