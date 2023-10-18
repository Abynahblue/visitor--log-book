import { Request } from "express";
declare module Express {
    export interface Request {
      decoded: string;
      currentUserId: string
    }
}
export interface CustomExpressRequest extends Request {
    currentUserId: string;
    role: string;
    currentPassword: string
}

export interface DecodedToken {
  email: string
}