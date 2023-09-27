import { Request, Response, NextFunction } from "express"

const catchAsync = (fn: any): any => {
    return (res: Response, req: Request, next: NextFunction) => fn(res, req, next).catch(next)
}

export default catchAsync;