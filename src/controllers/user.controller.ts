import { Request, Response } from "express";
import { apiErrorResponse, apiResponse } from "../utility/apiErrorResponse";
import catchAsync from "../utility/catchAsync";
import { deleteUserServices, getAllHostsServicesById, getAllUserServices, getUserByIDService, getUserService, updateUserServices } from "../services/user.services";

const getAllUsers = catchAsync(async (req: Request, res: Response,) => {
    const users = await getAllUserServices();
    if (!users) return apiErrorResponse(400, "Error fetching guests", res)
    return apiResponse(200, users, null, res)
})

const getAllHosts = async (req: Request, res: Response) => {
    try {
        const host = await getAllHostsServicesById('password')
        if (!host) return apiErrorResponse(400, 'There is no host matching your search', res)

        return apiResponse(201, host, null, res)
    } catch (error) {
        return apiErrorResponse(400, 'Internal Server Error', res)

    }
}

const getUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const user = await getUserService(id)
        if (!id) return apiErrorResponse(400, 'User does not exist', res)

        return apiResponse(201, user, null, res)
    } catch (error) {
        return apiErrorResponse(500, 'Internal Server', res)
    }
}

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = await getUserByIDService(userId);
    if (!user) return apiErrorResponse(400, "Invalid Id", res);
    await updateUserServices(userId, req.body);
    return apiResponse(200, null, "User updated successfully", res);
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    await deleteUserServices(userId);
    return apiResponse(204, null, null, res);
});


export {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    getAllHosts
}