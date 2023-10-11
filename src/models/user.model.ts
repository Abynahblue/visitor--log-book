import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt"
import { IUserModel, IUser } from "../interface/user.interface";

export const userSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String ,
        required: true,
        minlength: 8,
        select: false
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    company: {
        type: String,
        required: true
    }, 
    role:{
        type: String,
        enum: ["Admin", "Host"],
        required: true
    },
    
}, { timestamps: true })


const UserModel = model<IUserModel>("User", userSchema)

export default UserModel;