import { db } from '../../database/db';
import type User from './user';

export default class Conversation {
	public id!: number;
	public character_id!: number;
	public createdAt!: Date;
	public updatedAt!: Date;

	static create(data: Partial<Conversation>): number | bigint {
		const now = new Date().toISOString();
		const query = db.prepare(
			'INSERT INTO conversation (character_id, createdAt, updatedAt) VALUES (?, ?, ?)',
		);
		const result = query.run(data.character_id!, now, now);
		return result.lastInsertRowid;
	}

	static delete(id: number): void {
		const query = db.prepare('DELETE FROM conversation WHERE id = ?');
		query.run(id);
	}

	static update(id: number, data: Partial<Conversation>): number | bigint {
		const updates = Object.keys(data)
			.map((key) => `${key} = ?`)
			.join(', ');
		const values = [...Object.values(data), new Date().toISOString(), id];

		const query = db.prepare(
			`UPDATE conversation SET ${updates}, updatedAt = ? WHERE id = ?`,
		);
		// @ts-ignore
		const result = query.run(...values);
		return result.lastInsertRowid;
	}

	static findOne(id: number): Conversation | null {
		const query = db.prepare('SELECT * FROM conversation WHERE id = ?');
		const result = query.get(id) as Conversation | null;
		return result;
	}

	static findAll(): Conversation[] {
		const query = db.prepare('SELECT * FROM conversation');
		const results = query.all() as Conversation[];
		return results;
	}

	static findByCharacterId(characterId: number): Conversation[] {
		const query = db.prepare(
			'SELECT * FROM conversation WHERE character_id = ?',
		);
		const results = query.all(characterId) as Conversation[];
		return results;
	}

	static getConversationOwner(conversationId: number): User {
		const query = db.prepare(`
			SELECT u.* FROM user u
			JOIN universe univ ON u.id = univ.user_id
			JOIN character c ON c.universe_id = univ.id
			JOIN conversation conv ON conv.character_id = c.id
			WHERE conv.id = ?
			LIMIT 1;
		`);
		return query.get(conversationId) as User;
	}

	static getMessages(conversationId: number) {
		const query = db.prepare(
			'SELECT * FROM message WHERE conversation_id = ? ORDER BY createdAt ASC',
		);
		const results = query.all(conversationId);
		return results;
	}

	static getConversationsForUser(userId: number) {
		const query = db.prepare(`
			SELECT conv.* FROM conversation conv
			JOIN character c ON c.id = conv.character_id
			JOIN universe univ ON univ.id = c.univer_id
			WHERE univ.user_id = ?
		`);
		const results = query.all(userId);
		return results;
	}
}
