import mongoose from "mongoose";

interface ISignOut{
    status: boolean,
    date: Date | null
}


export interface IVisit {
    sign_in: Date;
    sign_out: ISignOut;
    guest_id: mongoose.Schema.Types.ObjectId;
    host_id: mongoose.Schema.Types.ObjectId;
}

export type IvisitModel = IVisit & mongoose.Document
