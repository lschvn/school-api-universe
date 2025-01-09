import consola from 'consola'
import { db } from './db'

const userMigration = () =>
    db.run(`
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        createdAt DATETIME,
        updatedAt DATETIME
    );
`)

const universeMigration = () =>
    db.run(`
    CREATE TABLE IF NOT EXISTS universe (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        banner_url VARCHAR(255),
        user_id INT,
        createdAt DATETIME,
        updatedAt DATETIME,
        CONSTRAINT fk_user
        FOREIGN KEY (user_id) REFERENCES user(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
`)

const characterMigration = () => {
    db.run(`
    CREATE TABLE IF NOT EXISTS character (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        avatar_url VARCHAR(255),
        univer_id INT,
        createdAt DATETIME,
        updatedAt DATETIME,
        CONSTRAINT fk_universe
        FOREIGN KEY (univer_id) REFERENCES universe(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
    `)
}

userMigration()
consola.info('User table created')
universeMigration()
consola.info('Universe table created')
characterMigration()
consola.info('Character table created')
