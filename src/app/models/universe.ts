import { db } from '../../database/db'

export default class Universe {
    public id!: number
    public name!: string
    public description!: string
    public banner_url!: string
    public user_id!: number
    public createdAt!: Date
    public updatedAt!: Date

    static create(data: Partial<Universe>): void {
        const now = new Date().toISOString()
        const query = db.prepare(
            'INSERT INTO universe (name, description, banner_url, user_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
        )
        query.run(
            data.name!,
            data.description!,
            data.banner_url!,
            data.user_id!,
            now,
            now
        )
    }

    static delete(id: number): void {
        const query = db.prepare('DELETE FROM universe WHERE id = ?')
        query.run(id)
    }

    static update(id: number, data: Partial<Universe>): void {
        const updates = Object.keys(data)
            .map((key) => `${key} = ?`)
            .join(', ')
        const values = [...Object.values(data), new Date().toISOString(), id]

        const query = db.prepare(
            `UPDATE universe SET ${updates}, updatedAt = ? WHERE id = ?`
        )
        query.run(...values)
    }

    static findOne(id: number): Universe | null {
        const query = db.prepare('SELECT * FROM universe WHERE id = ?')
        const result = query.get(id) as Universe | null
        return result
    }

    static findAll(): Universe[] {
        const query = db.prepare('SELECT * FROM universe')
        const results = query.all() as Universe[]
        return results
    }

    static findByUserId(userId: number): Universe[] {
        const query = db.prepare('SELECT * FROM universe WHERE user_id = ?')
        const results = query.all(userId) as Universe[]
        return results
    }

    static findByName(name: string): Universe | null {
        const query = db.prepare('SELECT * FROM universe WHERE name = ?')
        const result = query.get(name) as Universe | null
        return result
    }
}
