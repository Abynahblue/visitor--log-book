import mongoose, { Schema, model } from "mongoose";
import { IVisit, IvisitModel } from "../interface/visit.interface";

const visitSchema = new Schema<IVisit>({
    sign_in: { type: Date },
    sign_out: {
        status: {
            default: false,
            type: Boolean
        },
        date: {
            type: Date,
            default: null
        }
    },
    guest_id: { type: mongoose.Types.ObjectId, ref: "Guest", required: true },
    hostEmail: String,
})

const VisitModel = model<IvisitModel>("VisitLog", visitSchema)

export default VisitModel;