import mongoose, { Schema, model } from "mongoose";
import { IVisit, IvisitModel } from "../interface/visit.interface";

const visitSchema = new Schema<IVisit>({
    sign_in: { type: Date },
    sign_out: {type: Date},
    guest_id: { type: mongoose.Types.ObjectId , ref: "Guest", required: true},
    host_id: { type: mongoose.Types.ObjectId, ref: "host" , required: true},
    purpose:{type: String, required: true}
})

const VisitModel = model<IvisitModel>("VisitLog", visitSchema)

export default VisitModel;