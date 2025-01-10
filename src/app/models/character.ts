import { db } from '../../database/db';

export default class Character {
	public id!: number;
	public name!: string;
	public description!: string;
	public avatar_url!: string;
	public univer_id!: number;
	public createdAt!: Date;
	public updatedAt!: Date;

	static create(data: Partial<Character>): number {
		const now = new Date().toISOString();
		const query = db.prepare(
			'INSERT INTO character (name, description, avatar_url, univer_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
		);
		const result = query.run(
			data.name!,
			data.description!,
			data.avatar_url!,
			data.univer_id!,
			now,
			now,
		);
		return result.lastInsertRowid;
	}

	static delete(id: number): void {
		const query = db.prepare('DELETE FROM character WHERE id = ?');
		query.run(id);
	}

	static update(id: number, data: Partial<Character>): void {
		const updates = Object.keys(data)
			.map((key) => `${key} = ?`)
			.join(', ');
		const values = [...Object.values(data), new Date().toISOString(), id];

		const query = db.prepare(
			`UPDATE character SET ${updates}, updatedAt = ? WHERE id = ?`,
		);
		query.run(...values);
	}

	static findOne(id: number): Character | null {
		const query = db.prepare('SELECT * FROM character WHERE id = ?');
		const result = query.get(id) as Character | null;
		return result;
	}

	static findAll(): Character[] {
		const query = db.prepare('SELECT * FROM character');
		const results = query.all() as Character[];
		return results;
	}

	static findByUniverseId(univerId: number): Character[] {
		const query = db.prepare('SELECT * FROM character WHERE univer_id = ?');
		const results = query.all(univerId) as Character[];
		return results;
	}

	static findByName(name: string): Character | null {
		const query = db.prepare('SELECT * FROM character WHERE name = ?');
		const result = query.get(name) as Character | null;
		return result;
	}
}
