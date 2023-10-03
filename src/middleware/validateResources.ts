import {Request, Response, NextFunction } from "express";
const { validationResult, ValidationChain, check } = require('express-validator');
import { apiErrorResponse } from "../utility/apiErrorResponse";

export const guestSchema = {
    name: check("name").notEmpty(),
    email: check("email").isEmail(),
    phone: check("phone")
        .notEmpty()
        .isMobilePhone(["en-GH"], { strictMode: false })
        .withMessage("Invalid phone number"),
    purpose: check("purpose").notEmpty(),
}


export const validateResource = (schema: any) => {
    return (async (req: Request, res: Response, next: NextFunction) => {
        const keys = Object.keys(schema)
        const validationChecks = keys.map(async (key) => await schema[key].run(req))
        await Promise.all(validationChecks)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            
            return apiErrorResponse(400, errors.array(), res)
        }
        next()
    })
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