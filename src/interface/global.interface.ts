import { Types } from "mongoose";

type IResponseData = string | {
    [key: string]: any;
    id?: Types.ObjectId
}

interface IServiceOptions {
    populate?: string
}

export { IResponseData, IServiceOptions }