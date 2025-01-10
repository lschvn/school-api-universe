import consola from 'consola';
import { db } from './db';

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
`);

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
`);

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
    `);
};

const conversationMigration = () => {
	db.run(`
    CREATE TABLE IF NOT EXISTS conversation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INT,
        createdAt DATETIME,
        updatedAt DATETIME,
        CONSTRAINT fk_character
        FOREIGN KEY (character_id) REFERENCES character(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
    `);
};

const messageMigration = () => {
	db.run(`
    CREATE TABLE IF NOT EXISTS message (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INT,
        content TEXT,
        createdAt DATETIME,
        updatedAt DATETIME,
        CONSTRAINT fk_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversation(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
    `);
};

userMigration();
consola.info('User table created');
universeMigration();
consola.info('Universe table created');
characterMigration();
consola.info('Character table created');
conversationMigration();
consola.info('Conversation table created');
messageMigration();
consola.info('Message table created');
