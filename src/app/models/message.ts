import { db } from '../../database/db';

export default class Conversation {
	public id!: number;
	public conversation_id!: string;
	public content!: string;
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
}
