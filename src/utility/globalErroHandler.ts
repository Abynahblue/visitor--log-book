import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { apiErrorResponse } from "./apiErrorResponse";

const globalErrorHandler: ErrorRequestHandler = (
    error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('error: ', error);
    if (error.name === "MongoServerError") {
        switch (error.code) {
            case 11000:
                return apiErrorResponse(400, "Data Duplication is not allowed", res);
                break;
            default:
                return apiErrorResponse(400, "Encountered an error manipulating your data", res);
        }
    } else if (error.name === "ValidationError") {
        return apiErrorResponse(400, "Incorrect data format", res)
    } else if (error.name === "CastError") {
        return apiErrorResponse(400, "Invalid data format, please retype your data again", res)
    } else if (error.name === "TypeError") {
        return apiErrorResponse(400, "Encountered an error, try again", res)
    }
    apiErrorResponse(400, "Invalid request", res)
}

export default globalErrorHandler