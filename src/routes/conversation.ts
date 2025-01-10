import Character from '../app/models/character';
import Conversation from '../app/models/conversation';
import { Server } from '../server';
import { readBody } from '../server/utils/body';
import {
	createError,
	createResponse,
	getRouterParam,
} from '../server/utils/http';
import { getUserSession } from '../server/utils/session';

export const conversationRouter = new Server('/api/conversation');

/**
 * @api {post} /conversation/new
 * @description Create a new conversation
 *
 * @param {number} character_id - The id of character to start the conv with
 * @returns {object} - The created conversation
 */
conversationRouter.on('POST', '/new', async (event) => {
	const session = await getUserSession(event);
	if (!session?.user) {
		return createError(event, { status: 401, message: 'Unauthorized' });
	}

	const body = (await readBody(event)) as { character_id: number };
	if (!body.character_id) {
		return createError(event, {
			status: 422,
			message: 'Character ID is required',
		});
	}

	const existingConversation = Conversation.findOne(body.character_id);
	if (existingConversation) {
		return createError(event, {
			status: 400,
			message: 'A conversation with this character already exist',
		});
	}

	const conversationId = Conversation.create({
		character_id: body.character_id,
	});

	if (!conversationId) {
		return createError(event, {
			status: 500,
			message: 'An error occured',
		});
	}

	const conversation = Conversation.findOne(Number(conversationId));
	if (!conversation) {
		return createError(event, {
			status: 500,
			message: 'An error occured',
		});
	}

	return createResponse(event, {
		status: 201,
		message: 'Conversation created successfully',
		data: conversation,
	});
});

/**
 * @api {delete} /conversation/:id
 * @description Delete a conversation
 *
 * @returns {object} - Status or error
 */
conversationRouter.on('DELETE', '/:id', async (event) => {
	const session = await getUserSession(event);
	if (!session?.user) {
		return createError(event, { status: 401, message: 'Unauthorized' });
	}

	const id = getRouterParam(event, 'id');
	if (!id) {
		return createError(event, {
			status: 400,
			message: 'Missing required id parameter',
		});
	}

    const conversation = Conversation.findOne(parseInt(id))
    if (!conversation) {
		return createError(event, {
			status: 400,
			message: 'Conversation Not Found',
		});
    }

    const owner = Conversation.getConversationOwner(conversation.id)
    if(owner.id) {
        /**
         *  TODO: end this logic
         *  need to add getUniverse(conversationId) to Conversation
         *  to compare owner.id and universe.user_id
        */
    }
});
