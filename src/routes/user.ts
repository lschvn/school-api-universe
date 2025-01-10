import type { Request, Response } from "express";
import User from "../app/models/user";
import { Server } from "../server";
import { getRouterParam, createError, createResponse } from "../server/utils/http";
import { getUserSession } from "../server/utils/session";

export const userRouter = new Server('/api/user');

userRouter.on('GET', '/get/:id', async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) {
        return createError(event, {
            status: 400,
            message: 'Missing id parameter'
        });
    }

    const user = User.findOne(parseInt(id));
    if (!user) {
        return createError(event, {
            status: 404,
            message: 'User not found'
        });
    }

    return createResponse(event, {
        status: 200,
        message: 'User found successfully',
        data: { user }
    });
})

userRouter.on('DELETE', '/:id', async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) {
        return createError(event, {
            status: 400,
            message: 'Missing id parameter'
        });
    }

    const session = await getUserSession(event);
    if(!session?.user) {
        return createError(event, {status: 401, message: 'Unauthorized'})
    }

    const user = User.findOne(parseInt(id));
    if (!user) {
        return createError(event, {
            status: 404,
            message: 'User not found'
        });
    }

    if(user.id !== session.user.id) {
        return createError(event, {status: 403, message: 'Unauthorized'})
    }

    User.delete(parseInt(id));

    return createResponse(event, {
        status: 200,
        message: 'User deleted successfully'
    });
})

userRouter.on('GET', '/universes', async (event) => {
    const session = await getUserSession(event);
    if(!session?.user) {
        return createError(event, {status: 401, message: 'Unauthorized'})
    }

    if (session.user.id === undefined) {
        return createError(event, { status: 400, message: 'User ID is undefined' });
    }

    const universes = User.getUniverses(session.user.id);
    if(universes.length === 0) {
        return createError(event, {
            status: 404,
            message: 'No universes found'
        });
    }

    return createResponse(event, {
        status: 200,
        message: 'Universes found successfully',
        data: { universes }
    });
})