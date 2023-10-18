import mongoose, { Connection } from "mongoose";
import dotenv from 'dotenv';
import { data } from "./data"

//dotenv.config({ path: './.env' });

export default async () => {
    const DB_URL = data.DB_URL_DEVELOPMENT



    const db_uri = `${DB_URL}`.replace("<PASSWORD>", data.DB_PASSWORD!)

    try {
        mongoose.set("strictQuery", false);
        const conn = await mongoose.connect(db_uri);
        return conn;
    } catch (error) {
        if (error) {
            console.log("Can not connect to database", error);

            process.exit(1);
        }
    }
}

