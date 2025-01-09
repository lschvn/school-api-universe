import Universe from "../app/models/universe";
import { Router } from "../server/router";
import { readBody } from "../server/utils/body";
import { createError, createResponse } from "../server/utils/http";
import { getUserSession } from "../server/utils/session";

export const universeRouter = new Router({ prefix: '/universe' });

/**
 * @api {post} /universe/new
 * @description Create a new universe
 *
 * @param {string} name - The name of the universe
 * @param {string} description - The description of the universe
 * @returns {object} - The created universe
 */
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

/**
 * @api {get} /universe/:id
 * @description Get a universe by id
 *
 * @param {number} id - The id of the universe
 * @returns {object} - The requested universe
 */
universeRouter.on('GET', '/:id', async (event) => {
    const id = event.params?.id;
    if (!id) {
        return createError(event, {
            status: 400,
            message: 'Missing id parameter'
        });
    }

    const universe = Universe.findOne(parseInt(id));
    if (!universe) {
        return createError(event, {
            status: 404,
            message: 'Universe not found'
        });
    }

    return createResponse(event, {
        status: 200,
        data: { universe }
    });
});