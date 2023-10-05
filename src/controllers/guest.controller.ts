import { Request, Response } from "express";
import catchAsync from "../utility/catchAsync";
import { createGuestServices, getAllGuestServices, getGuestService } from "../services/guest.services";
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import { userResponses } from "../constants/guest.constants";
import { IGuest, IGuestModel } from "../interface/guest.interface";
import { generateToken } from "../middleware/email";
import { getHostService, searchHostsServices } from "../services/host.services";

const registerGuest = catchAsync(async (req: Request, res: Response) => {
    const { first_name, last_name, email, phone } = req.body;

    try {
        if (!first_name || !last_name || !email || !phone) {
            return apiErrorResponse(400, "Please add all fields!", res)
        }

        const data: IGuest = {
            first_name,
            last_name,
            email,
            phone
        }
        const newGuest = await createGuestServices(data)

        if (newGuest) {
            const token = generateToken(newGuest._id);
            return apiResponse(201, {
                guest_id: newGuest._id,
                name: `${newGuest.first_name} ${newGuest.last_name}`,
                email: newGuest.email,
                phone: newGuest.phone, token}, null, res)
        } 
        else {
            return apiErrorResponse(400, "User exists already", res)
        }
        

    } catch (err) {
        console.log(err);

        return apiErrorResponse(400, "Internal Server Error", res)
    }
})

const getGuest = async (req: Request, res: Response) => {
    const id  = req.params.id;
    try {
        const guest = await getGuestService(id)
        if (!id) return apiErrorResponse(400, 'Host does not exist', res)
        
        return apiResponse(201, guest, null, res)
    } catch (error) {
        console.log(error);
        return apiErrorResponse(500, 'Internal Server', res)
    }
}

 


// const checkOut = catchAsync(async (req: Request, res: Response) => {
//     const guestId = req.params.id
//     const guest = await getGuestService(guestId)
//     if (!guest) return apiErrorResponse(400, userResponses.INVALID_ID, res)
//     guest.checkOutTime = new Date()
//     await guest.save();
//     return apiResponse(200, guest, "Guest check-out successful.", res)
// })

const getAllGuests = catchAsync(async (req: Request, res: Response,) => {
    const guests = await getAllGuestServices();
    if (!guests) return apiErrorResponse(400, "Error fetching guests", res)
    return apiResponse(200, guests, null, res)
})

const searchHosts = async (req: Request, res: Response) => {
    try {
        const host = await searchHostsServices()
        if (!host) return apiErrorResponse(400, 'There is no host matching your search', res)
        
        return apiResponse(201, host, 'host retrieved successfully', res)
    } catch (error) {
        console.log(error);
        return apiErrorResponse(400, 'Internal Server Error', res)
        
    }
}

export { registerGuest, getAllGuests, getGuest, searchHosts };