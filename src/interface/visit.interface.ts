import mongoose from "mongoose";

export interface IVisit {
    sign_in: Date;
    sign_out?: Date;
    guest_id: mongoose.Schema.Types.ObjectId;
    host_id: mongoose.Schema.Types.ObjectId;
    purpose: string;
}

export type IvisitModel = IVisit & mongoose.Document
