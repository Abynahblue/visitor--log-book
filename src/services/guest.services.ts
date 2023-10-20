import { Request, Response } from "express";
import { IGuest } from "../interface/guest.interface";
import catchAsync from "../utility/catchAsync";
import GuestModel from "../models/guest.model";
import { apiErrorResponse } from "../utility/apiErrorResponse";
import { QRCode } from "qrcode";

const createGuestServices = async (data: IGuest) => {
    try {
        const existingGuest = await GuestModel.findOne({ email: data.email })
        if (existingGuest) return false
        return await GuestModel.create(data)

    } catch (error) {
        throw error
    }
}
const getGuestService = async (id: string) => GuestModel.findById(id);

const getGuestByEmailService = async (email: string, select?: string) => GuestModel.findOne({ email }).select(select);

const getGuestWithQrCodeServices = async (qrCode: string) => GuestModel.findOne({ qrCode: qrCode })

const getAllGuestServices = async () => GuestModel.find();

const deleteGuestService = async (id: string) => GuestModel.findByIdAndDelete(id)


export {
    createGuestServices,
    getGuestService,
    getAllGuestServices,
    deleteGuestService,
    getGuestByEmailService,
    getGuestWithQrCodeServices
};