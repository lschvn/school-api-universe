import AI from '../app/controllers/ai';
import Universe from '../app/models/universe';
import { Server } from '../server';
import { readBody } from '../server/utils/body';
import {
	createError,
	createResponse,
	getRouterParam,
} from '../server/utils/http';
import { getUserSession } from '../server/utils/session';

export const universeRouter = new Server('/api/universe');

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
	if (!session?.user) {
		return createError(event, { status: 401, message: 'Unauthorized' });
	}

	const body = (await readBody(event)) as { name: string };
	if (!body.name) {
		return createError(event, { status: 422, message: 'Name is required' });
	}

	const description = await AI.Description(body.name);
	const bannerUrl = await AI.Banner(description);

	const universeId = Universe.create({
		name: body.name,
		description,
		banner_url: bannerUrl,
		user_id: session.user.id,
	});
	if (!universeId) {
		return createError(event, {
			status: 500,
			message: 'Failed to create universe',
		});
	}

	const universe = Universe.findOne(universeId);

	return createResponse(event, {
		status: 201,
		message: 'Universe created successfully',
		data: { universe },
	});
});

/**
 * @api {get} /universe/:id
 * @description Get a universe by id
 *
 * @param {number} id - The id of the universe
 * @returns {object} - The requested universe
 */
universeRouter.on('GET', '/:id', async (event) => {
	const id = getRouterParam(event, 'id');
	if (!id) {
		return createError(event, {
			status: 400,
			message: 'Missing id parameter',
		});
	}

	const session = await getUserSession(event);
	if (!session?.user) {
		return createError(event, { status: 401, message: 'Unauthorized' });
	}

	const universe = Universe.findOne(parseInt(id));
	if (!universe) {
		return createError(event, {
			status: 404,
			message: 'Universe not found',
		});
	}

	return createResponse(event, {
		status: 200,
		data: { universe },
	});
});

/**
 * @api {delete} /universe/:id
 * @description Delete a universe by id
 *
 * @param {number} id - The id of the universe
 * @returns {object} - The success message
 */
universeRouter.on('DELETE', '/:id', async (event) => {
	const id = getRouterParam(event, 'id');
	if (!id) {
		return createError(event, {
			status: 400,
			message: 'Missing id parameter',
		});
	}

	const session = await getUserSession(event);
	if (!session?.user) {
		return createError(event, { status: 401, message: 'Unauthorized' });
	}

	const universe = Universe.findOne(parseInt(id));
	if (!universe) {
		return createError(event, {
			status: 404,
			message: 'Universe not found',
		});
	}

	if (universe.user_id !== session.user.id) {
		return createError(event, { status: 403, message: 'Unauthorized' });
	}

	Universe.delete(parseInt(id));
	return createResponse(event, {
		status: 200,
		message: 'Universe deleted successfully',
	});
});

/**
 * @api {get} /universe
 * @description Get all universes
 *
 * @returns {object} - The list of universes
 */
universeRouter.on('GET', '/', async (event) => {
	const universes = Universe.findAll();
	return createResponse(event, {
		status: 200,
		data: { universes },
		message: 'List of universes fetched successfully',
	});
});

/**
 * @api {put} /universe/:id
 * @description Update a universe by id
 *
 * @param {number} id - The id of the universe
 * @param {string} name - The name of the universe
 * @param {string} description - The description of the universe
 * @returns {object} - The updated universe
 */
universeRouter.on('PUT', '/:id', async (event) => {
	const id = getRouterParam(event, 'id');
	if (!id) {
		return createError(event, {
			status: 400,
			message: 'Missing id parameter',
		});
	}

	const session = await getUserSession(event);
	if (!session?.user) {
		return createError(event, { status: 401, message: 'Unauthorized' });
	}

	const universe = Universe.findOne(parseInt(id));
	if (!universe) {
		return createError(event, {
			status: 404,
			message: 'Universe not found',
		});
	}

	if (universe.user_id !== session.user.id) {
		return createError(event, { status: 403, message: 'Unauthorized' });
	}

	const body = (await readBody(event)) as { name: string; description: string };
	if (!body.name) {
		return createError(event, { status: 422, message: 'Name is required' });
	}
	if (!body.description) {
		return createError(event, {
			status: 422,
			message: 'Description is required',
		});
	}

	Universe.update(parseInt(id), {
		name: body.name,
		description: body.description,
	});

	return createResponse(event, {
		status: 200,
		message: 'Universe updated successfully',
		data: { universe: Universe.findOne(parseInt(id)) },
	});
});

/**
 * @api {get} /universe/:id/characters
 * @description Get all characters in a universe
 *
 * @param {number} id - The id of the universe
 * @returns {object} - The list of characters
 */
universeRouter.on('GET', '/:id/characters', async (event) => {
	const id = getRouterParam(event, 'id');
	if (!id) {
		return createError(event, {
			status: 400,
			message: 'Missing id parameter',
		});
	}

	const session = await getUserSession(event);
	if (!session?.user) {
		return createError(event, { status: 401, message: 'Unauthorized' });
	}

	const universe = Universe.findOne(parseInt(id));
	if (!universe) {
		return createError(event, {
			status: 404,
			message: 'Universe not found',
		});
	}

	if (universe.user_id !== session.user.id) {
		return createError(event, { status: 403, message: 'Unauthorized' });
	}

	const characters = Universe.getCharacters(parseInt(id));
	return createResponse(event, {
		status: 200,
		data: { characters },
		message: 'List of characters fetched successfully',
	});
});
