import { db } from '../../database/db'

export default class User {
    public id!: number
    public name!: string
    public email!: string
    public password!: string
    public createdAt!: Date
    public updatedAt!: Date

    static create(data: Partial<User>): number {
        const now = new Date().toISOString()
        const query = db.prepare(
            'INSERT INTO user (name, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
        )
        const result = query.run(data.name!, data.email!, data.password!, now, now)
        return Number(result.lastInsertRowid)
    }

    static delete(id: number): void {
        const query = db.prepare('DELETE FROM user WHERE id = ?')
        query.run(id)
    }

    static update(id: number, data: Partial<User>): void {
        const updates = Object.keys(data)
            .map((key) => `${key} = ?`)
            .join(', ')
        const values = [...Object.values(data), new Date().toISOString(), id]

        const query = db.prepare(
            `UPDATE user SET ${updates}, updatedAt = ? WHERE id = ?`
        )
        query.run(...values)
    }

    static findOne(id: number): User | null {
        const query = db.prepare('SELECT * FROM user WHERE id = ?')
        const result = query.get(id) as User | null
        return result
    }

    static findAll(): User[] {
        const query = db.prepare('SELECT * FROM user')
        const results = query.all() as User[]
        return results
    }

    static findByEmail(email: string): User | null {
        const query = db.prepare('SELECT * FROM user WHERE email = ?')
        const result = query.get(email) as User | null
        return result
    }

    static sanitize(user: Partial<User>) {
        if (!user.password) return user
        delete user.password
        return user
    }
}
