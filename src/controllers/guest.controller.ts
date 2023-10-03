import { Request, Response } from "express";
import catchAsync from "../utility/catchAsync";
import { createGuestServices, getAllGuestServices, getGuestService } from "../services/guest.services";
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import { userResponses } from "../constants/guest.constants";
import { IGuest, IGuestModel } from "../interface/guest.interface";

const registerGuest = catchAsync(async (req: Request, res: Response) => {
    const { first_name, last_name, email, phone, purpose } = req.body;

    try {
        if (!first_name || !last_name || !email || !phone) {
            return apiErrorResponse(400, "Please add all fields!", res)
        }

        const data: IGuest = {
            first_name,
            last_name,
            email,
            phone,
            purpose,
            checkInTime: new Date(),
        }
        const newGuest = await createGuestServices(data)
        if (newGuest) {
            res.status(201).json({
                guest_id: newGuest._id,
                name: `${newGuest.first_name} ${newGuest.last_name}`,
                email: newGuest.email
            })
        } else {
            return apiErrorResponse(400, "User exists already", res)
        }

    } catch (err) {
        console.log(err);

        return apiErrorResponse(400, "Unable to create guest", res)
    }
})

const checkIn = catchAsync(async (req: Request, res: Response) => {
    const guestId = req.params.id
    const guest = await getGuestService(guestId)
    if (!guest) return apiErrorResponse(400, userResponses.INVALID_ID, res)
    guest.checkInTime = new Date()
    await guest.save();
    return apiResponse(200, guest, "Guest check-in successful.", res)
})

const checkOut = catchAsync(async (req: Request, res: Response) => {
    const guestId = req.params.id
    const guest = await getGuestService(guestId)
    if (!guest) return apiErrorResponse(400, userResponses.INVALID_ID, res)
    guest.checkOutTime = new Date()
    await guest.save();
    return apiResponse(200, guest, "Guest check-out successful.", res)
})

const getAllGuests = catchAsync(async (req: Request, res: Response,) => {
    const guests = await getAllGuestServices();
    if (!guests) return apiErrorResponse(400, "Error fetching guests", res)
    return apiResponse(200, guests, null, res)
})

export { registerGuest, checkIn, checkOut, getAllGuests }