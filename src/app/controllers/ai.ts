import OpenAI from 'openai';
import Character from '../models/character';
import Conversation from '../models/conversation';
import Message from '../models/message';

export default class AI {
	static client: OpenAI;

	static Init() {
		if (AI.client) {
			return;
		}

		AI.client = new OpenAI({
			apiKey: process.env.OPEN_AI_API_KEY,
		});

		if (!AI.client) {
			throw new Error('Failed to initialize OpenAI client');
		}
	}

	static async Chat({
		character,
		message: userMessage,
	}: {
		character: Character;
		message: string;
	}) {
		AI.Init();

		// Retrieve the character from the DB to get the associated conversation id
		const dbCharacter = Character.findOne(character.id);
		if (!dbCharacter) {
			throw new Error('Character not found');
		}

		// Try to find an existing conversation for the character
		let conversation = Conversation.findByCharacterId(character.id);

		// If no conversation exists, create a new one
		if (!conversation || conversation.length === 0) {
			const conversationId = Conversation.create({
				character_id: character.id,
			});
			if (!conversationId) {
				throw new Error('Failed to create conversation');
			}
			conversation = [Conversation.findOne(Number(conversationId))!];
		}

		// Retrieve all previous messages from the conversation
		const messages = Conversation.getMessages(conversation[0].id);

		// Build the chat history for OpenAI, starting with a system message representing the character
		const chatHistory = [
			{
				role: 'system',
				content: `You are the character ${dbCharacter.name}, with traits: ${dbCharacter.description}`,
			},
			...messages.map((msg: any) => ({
				role: msg.id === character.id ? 'user' : 'assistant',
				content: msg.content,
			})),
			{ role: 'user', content: userMessage },
		];

		// Use OpenAI client to generate the response
		const completion = await AI.client.chat.completions.create({
			messages: chatHistory as any,
			model: 'gpt-4o',
		});

		const aiMessage = completion.choices[0].message?.content;

		return aiMessage;
	}

	static async Banner(universeDescription: string) {
		AI.Init();

		// Use the OpenAI image generation API to generate a banner image based on the universe description
		const imageResponse = await AI.client.images.generate({
			prompt: `Create an artistic banner image that captures the essence of the following universe: "${universeDescription}"`,
			n: 1,
		});

		return imageResponse.data[0].url;
	}

	static async Avatar(
		universeDescription: string,
		characterName: string,
	): Promise<string> {
		AI.Init();

		const prompt = `Create an artistic avatar for a character named "${characterName}" in a universe described as "${universeDescription}".`;
		const imageResponse = await AI.client.images.generate({ prompt, n: 1 });

		return String(imageResponse.data[0].url);
	}

	static async Description(universeName: string): Promise<string> {
		AI.Init();

		// Use OpenAI's chat completion to generate a short descriptive text in English for the given universe
		const completion = await AI.client.chat.completions.create({
			messages: [
				{
					role: 'user',
					content: `Generate a short and vivid description in English for a universe called "${universeName}".`,
				},
			],
			model: 'gpt-4o',
		});

		return String(completion.choices[0].message?.content);
	}

	static async DescriptionCharacter(
		characterName: string,
		universeDescription: string,
	): Promise<string> {
		AI.Init();

		// Use OpenAI's chat completion to generate a short descriptive text in English for the character in the given universe
		const completion = await AI.client.chat.completions.create({
			messages: [
				{
					role: 'user',
					content: `Generate a short and vivid description in English for a character named "${characterName}" in a universe described as "${universeDescription}".`,
				},
			],
			model: 'gpt-4o',
		});

		return String(completion.choices[0].message?.content);
	}
}
