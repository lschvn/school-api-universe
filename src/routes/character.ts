import Character from '../app/models/character';
import Universe from '../app/models/universe';
import { Server } from '../server';
import { readBody } from '../server/utils/body';
import {
	createError,
	createResponse,
	getRouterParam,
} from '../server/utils/http';
import { getUserSession } from '../server/utils/session';

export const characterRouter = new Server('/api/character');

/**
 * @api {post} /character/new
 * @description Create a new character
 *
 * @param {string} name - The name of the character
 * @param {string} description - The description of the character
 * @param {number} univer_id - The id of the universe the character belongs to
 * @returns {object} - The created character
 */
characterRouter.on('POST', '/new', async (event) => {
	const session = await getUserSession(event);
	if (!session?.user) {
		return createError(event, { status: 401, message: 'Unauthorized' });
	}

	const body = (await readBody(event)) as {
		name: string;
		description: string;
		univer_id: number;
	};
	if (!body.name) {
		return createError(event, { status: 422, message: 'Name is required' });
	}
	if (!body.description) {
		return createError(event, {
			status: 422,
			message: 'Description is required',
		});
	}
	if (!body.univer_id) {
		return createError(event, {
			status: 422,
			message: 'Universe id is required',
		});
	}

	const characterId = Character.create({
		name: body.name,
		description: body.description,
		univer_id: body.univer_id,
	});
	if (!characterId) {
		return createError(event, {
			status: 500,
			message: 'Failed to create character',
		});
	}

	const character = Character.findOne(characterId);

	return createResponse(event, {
		status: 201,
		message: 'Character created successfully',
		data: { character },
	});
});

/**
 * @api {get} /character/:id
 * @description Get a character by id
 *
 * @param {number} id - The id of the character
 * @returns {object} - The requested character
 */
characterRouter.on('GET', '/:id', async (event) => {
	const id = getRouterParam(event, 'id');
	if (!id) {
		return createError(event, {
			status: 400,
			message: 'Missing id parameter',
		});
	}

	const character = Character.findOne(parseInt(id));
	if (!character) {
		return createError(event, {
			status: 404,
			message: 'Character not found',
		});
	}

	return createResponse(event, {
		status: 200,
		data: { character },
	});
});

/**
 * @api {delete} /character/:id
 * @description Delete a character by id
 *
 * @param {number} id - The id of the character
 * @returns {object} - The success message
 */
characterRouter.on('DELETE', '/:id', async (event) => {
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

	const character = Character.findOne(parseInt(id));
	if (!character) {
		return createError(event, {
			status: 404,
			message: 'Character not found',
		});
	}

	const universe = Universe.findOne(character.univer_id);
	if (!universe) {
		return createError(event, {
			status: 404,
			message: 'Universe not found',
		});
	}

	if (universe.user_id !== session.user.id) {
		return createError(event, { status: 403, message: 'Unauthorized' });
	}

	Character.delete(parseInt(id));
	return createResponse(event, {
		status: 200,
		message: 'Character deleted successfully',
	});
});

/**
 * @api {put} /character/:id
 * @description Update a character by id
 *
 * @param {number} id - The id of the character
 * @param {string} name - The name of the character
 * @param {string} description - The description of the character
 * @returns {object} - The updated character
 */
characterRouter.on('PUT', '/:id', async (event) => {
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

	const character = Character.findOne(parseInt(id));
	if (!character) {
		return createError(event, {
			status: 404,
			message: 'Character not found',
		});
	}

	const universe = Universe.findOne(character.univer_id);
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

	Character.update(parseInt(id), {
		name: body.name,
		description: body.description,
	});

	return createResponse(event, {
		status: 200,
		message: 'Character updated successfully',
		data: { character: Character.findOne(parseInt(id)) },
	});
});
