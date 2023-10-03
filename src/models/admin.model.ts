import { Schema ,Document, model} from "mongoose";
import { IAdmin, IAdminModel } from "../interface/admin.interface";
import bcrypt from "bcrypt"

const adminSchema = new Schema<IAdmin>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    company: { type: String, require: true },
})

// adminSchema.pre<IAdmin>('save', async function (next) {
//     const admin = this;
//     if (!admin.isModified('password')) return next();

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(admin.password, salt);
//     admin.password = hashedPassword;
//     next();
// })

const AdminModel = model<IAdminModel>("Admin", adminSchema);
export { AdminModel };