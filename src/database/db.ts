import { Database } from 'bun:sqlite'

export const db = new Database('./src/database/db.sqlite', { create: true })
