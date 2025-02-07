// Unused Chat import removed.
import Conversation from '../app/models/conversation';
import Message from '../app/models/message';
import { Server } from '../server';
import { readBody } from '../server/utils/body';
import {
	createError,
	createResponse,
	getRouterParam,
} from '../server/utils/http';
import { getUserSession } from '../server/utils/session';
import AI from '../app/controllers/ai';
import Character from '../app/models/character';

export const messageRouter = new Server('/api/message');

/**
 * @api {post} /message/new
 * @description Create a new message
 *
 * @param {number} conversation_id - The id of the conversation to send the message to
 * @param {string} content - The content of the message
 * @returns {object} - The created message
 */
messageRouter.on('POST', '/new', async (event) => {
	const session = await getUserSession(event);
	if (!session?.user) {
		return createError(event, { status: 401, message: 'Unauthorized' });
	}

	const body = (await readBody(event)) as {
		conversation_id: number;
		content: string;
	};
	if (!body.conversation_id) {
		return createError(event, {
			status: 422,
			message: 'Conversation ID is required',
		});
	}
	if (!body.content) {
		return createError(event, {
			status: 422,
			message: 'Content is required',
		});
	}

	const conversation = Conversation.findOne(body.conversation_id);
	if (!conversation) {
		return createError(event, {
			status: 404,
			message: 'Conversation not found',
		});
	}

	const messageId = Message.create({
		conversation_id: body.conversation_id,
		content: body.content,
    sender: 'user'
	});
	if (!messageId) {
		return createError(event, {
			status: 500,
			message: 'Failed to create message',
		});
	}

	const character = Character.findOne(conversation.character_id);
	if (!character) {
		return createError(event, {
			status: 404,
			message: 'Character not found',
		});
	}

	const message = Message.findOne(Number(messageId));

	const response = (await AI.Chat({
		character,
		message: body.content,
	})) as string;

	Message.create({
		conversation_id: body.conversation_id,
		content: response,
    sender: 'bot'
	});

	return createResponse(event, {
		status: 201,
		data: { message, response },
	});
});

/**
 * @api {delete} /message/:id
 * @description Delete a message
 */
messageRouter.on('DELETE', '/:id', async (event) => {
	const session = await getUserSession(event);
	if (!session?.user) {
		return createError(event, { status: 401, message: 'Unauthorized' });
	}

	const id = getRouterParam(event, 'id');

	const messageId = Number(id);
	if (!messageId) {
		return createError(event, {
			status: 422,
			message: 'Message ID is required',
		});
	}

	const message = Message.findOne(messageId);
	if (!message) {
		return createError(event, {
			status: 404,
			message: 'Message not found',
		});
	}

	const owner = Conversation.getConversationOwner(message.conversation_id);
	if (owner.id !== session.user.id) {
		return createError(event, {
			status: 401,
			message: 'Unauthorized',
		});
	}

	Message.delete(messageId);

	return createResponse(event, {
		status: 204,
		message: 'Message deleted successfully',
	});
});

/**
 * @api {put} /message/:id
 * @description Update a message
 */
messageRouter.on('PUT', '/:id', async (event) => {
	const session = await getUserSession(event);
	if (!session?.user) {
		return createError(event, { status: 401, message: 'Unauthorized' });
	}

	const id = getRouterParam(event, 'id');

	const messageId = Number(id);
	if (!messageId) {
		return createError(event, {
			status: 422,
			message: 'Message ID is required',
		});
	}

	const message = Message.findOne(messageId);
	if (!message) {
		return createError(event, {
			status: 404,
			message: 'Message not found',
		});
	}

	const owner = Conversation.getConversationOwner(message.conversation_id);
	if (owner.id !== session.user.id) {
		return createError(event, {
			status: 401,
			message: 'Unauthorized',
		});
	}

	const body = (await readBody(event)) as {
		content: string;
	};
	if (!body.content) {
		return createError(event, {
			status: 422,
			message: 'Content is required',
		});
	}

	Message.update(messageId, {
		content: body.content,
	});

	return createResponse(event, {
		status: 200,
		message: 'Message updated successfully',
	});
});

/**
 * @api {get} /messages/conversation/:id
 * @description Get all messages from a conversation
 */
messageRouter.on('GET', '/conversation/:id', async (event) => {
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

  const conversation = Conversation.findOne(parseInt(id));
  if (!conversation) {
    return createError(event, {
      status: 404,
      message: 'Conversation not found',
    });
  }

  const messages = Conversation.getMessages(conversation.id);

  return createResponse(event, {
    status: 200,
    data: messages,
  });
});
