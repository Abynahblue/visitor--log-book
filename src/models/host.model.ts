import { model, Schema } from "mongoose";
import { IHost, IHostModel } from "../interface/host.interface";

const hostSchema = new Schema<IHost>({
    host_firstname: {type: String, required: true }, 
    host_lastname: {type: String, required: true},
    host_email: { type: String, required: true, unique: true },
    host_phone: { type: String, required: true },
    password: { type: String, required: true },
    host_company:{type: String, required: true},
    confirmationCode: { type: String}
})

const HostModel = model<IHostModel>("host", hostSchema)

export default HostModel;