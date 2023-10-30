import {Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain, check } from'express-validator';
import {promisify} from "util"
import { apiErrorResponse } from "../utility/apiErrorResponse";
import jwt from "jsonwebtoken";
import { IUser, IUserModel } from "../interface/user.interface";
import UserModel from "../models/user.model";
import { CustomExpressRequest } from "../types";



export const guestSchema = {
    name: check("name").notEmpty(),
    email: check("email").isEmail(),
    phone: check("phone")
        .notEmpty()
        .isMobilePhone(["en-GH"], { strictMode: false })
        .withMessage("Invalid phone number"),
}

export const Schema = {
    name: check("name").notEmpty(),
    email: check("email").isEmail(),
    phone: check("phone")
        .notEmpty()
        .isMobilePhone(["en-GH"], { strictMode: false })
        .withMessage("Invalid phone number"),
}


export const validateResource = (schema: any) => {
    return (async (req: Request, res: Response, next: NextFunction) => {
        const keys = Object.keys(schema)
        const validationChecks = keys.map(async (key) => await schema[key].run(req))
        await Promise.all(validationChecks)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            
            return apiErrorResponse(400, errors.array(), res)
        }
        next()
    })
} 

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token =req.headers.authorization.split(' ')[1]
    }
    if (!token) {
        return apiErrorResponse(400, "You are not logged in! Please login to get access", res)
    } try {
        const decoded: any = await jwt.verify(token, process.env.JWT_SECRET!)
        const {_id, role} = decoded
        const currentUser: IUser | null = await UserModel.findById(_id)
        
        if (!currentUser) {
            return apiErrorResponse(400, "The user belonging to this token does not exist.", res)
        }
        (req as CustomExpressRequest).currentUserId = _id;
        (req as CustomExpressRequest).role = role;

        next();
    } catch (error) {
        return apiErrorResponse(400, "Your jwt is incorrect or expired", res)
    }
}

export const restrictTo = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as CustomExpressRequest).role 
        if (role !== userRole) {
            return apiErrorResponse(400, "You do not permission to perform this action.", res)
        }
        next();
    }
}


// const keys = Object.keys(schema)
        
// const validationChecks = keys.map(async (key) =>  await schema[key](req))

// await Promise.all(validationChecks)

// const errors = validationResult(req);
// if (!errors.isEmpty()) {
//     return apiErrorResponse(400, errors.array(), res)
// }

// return async (req, res, next) => {
//     for (let validation of validations) {
//       const result = await validation.run(req);
//       if (result.errors.length) break;
//     }

//     const errors = validationResult(req);
//     if (errors.isEmpty()) {
//       return next();
//     }

//     res.status(400).json({ errors: errors.array() });
//   };