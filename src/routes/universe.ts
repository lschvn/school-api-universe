import Universe from "../app/models/universe";
import { Router } from "../server/router";
import { readBody } from "../server/utils/body";
import { createError, createResponse } from "../server/utils/http";
import { getUserSession } from "../server/utils/session";

export const universeRouter = new Router({ prefix: '/universe' });

universeRouter.on('POST', '/new', async (event) => {
    const session = await getUserSession(event);
    if(!session?.user) {
        return createError(event, {status: 401, message: 'Unauthorized'})
    }

    const body = await readBody(event) as {name: string, description: string};
    if(!body.name) {
        return createError(event, {status: 422, message: 'Name is required'})
    }
    if(!body.description) {
        return createError(event, {status: 422, message: 'Description is required'})
    }

    const universeId = Universe.create({
        name: body.name,
        description: body.description,
        user_id: session.user.id,
    })
    if(!universeId) {
        return createError(event, {status: 500, message: 'Failed to create universe'})
    }

    const universe = Universe.findOne(universeId);

    return createResponse(event, {
        status: 201,
        message: 'Universe created successfully',
        data: {universe}
    })
})