import { db } from '../../database/db';

export default class Message {
	public id!: number;
	public conversation_id!: number;
	public content!: string;
	public sender!: 'user' | 'bot';
	public createdAt!: Date;
	public updatedAt!: Date;

	static create(data: Partial<Message>): number | bigint {
		const now = new Date().toISOString();
		const query = db.prepare(
			'INSERT INTO message (conversation_id, content, sender, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
		);
		const result = query.run(data.conversation_id!, data.content!, data.sender!, now, now);
		return result.lastInsertRowid;
	}

	static delete(id: number): void {
		const query = db.prepare('DELETE FROM message WHERE id = ?');
		query.run(id);
	}

	static update(id: number, data: Partial<Message>): number | bigint {
		const updates = Object.keys(data)
			.map((key) => `${key} = ?`)
			.join(', ');
		const values = [...Object.values(data), new Date().toISOString(), id];

		const query = db.prepare(
			`UPDATE message SET ${updates}, updatedAt = ? WHERE id = ?`,
		);
		// @ts-ignore
		const result = query.run(...values);
		return result.lastInsertRowid;
	}

	static findOne(id: number): Message | null {
		const query = db.prepare('SELECT * FROM message WHERE id = ?');
		const result = query.get(id) as Message | null;
		return result;
	}

	static findAll(): Message[] {
		const query = db.prepare('SELECT * FROM message');
		const results = query.all() as Message[];
		return results;
	}
}
