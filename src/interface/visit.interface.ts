import mongoose from "mongoose";

interface ISignOut{
    status: boolean,
    date: Date | null
}

interface ISignIn{
    status: boolean,
    date: Date | null
}


export interface IVisit {
    sign_in: ISignIn;
    sign_out: ISignOut;
    guest_id: mongoose.Schema.Types.ObjectId;
    user_id: mongoose.Schema.Types.ObjectId;
}

export type IvisitModel = IVisit & mongoose.Document
