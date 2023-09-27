import { Request, Response } from "express";
import { IGuest } from "../interface/guest.interface";
import { apiErrorResponse } from "../utility/apiErrorResponse";
import catchAsync from "../utility/catchAsync";
import GuestModel from "./guest.model";

const createGuestServices = async ( data: IGuest) => {
    try{
    const existingGuest = await GuestModel.findOne({ email: data.email })
    if(existingGuest) return false
    return await GuestModel.create(data)
       
    } catch (err) {
        console.log(err);
        
        return false
   }
}
const getGuestService = async (id: string) => GuestModel.findById(id);

const getAllGuestServices = async () => GuestModel.find();

const deleteGuestService = async (id: string) => GuestModel.findByIdAndDelete(id)

export {
    createGuestServices,
    getGuestService,
    getAllGuestServices,
    deleteGuestService
};