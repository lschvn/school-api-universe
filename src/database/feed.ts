import consola from 'consola';
import { db } from './db';

// Génération de données aléatoires
const randomString = (length: number) => {
	const chars =
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
};

const randomEmail = () => `${randomString(10)}@example.com`;

const generateFakeData = () => {
	// Générer des utilisateurs
	for (let i = 0; i < 10; i++) {
		const name = randomString(10);
		const email = randomEmail();
		const password = randomString(10);
		const now = new Date().toISOString();
		db.run(
			'INSERT INTO user (name, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
			name,
			email,
			password,
			now,
			now,
		);
	}

	// Récupérer les utilisateurs pour les univers
	const users = db.prepare('SELECT id FROM user').all();

	// Générer des univers
	for (let i = 0; i < 5; i++) {
		const name = randomString(15);
		const description = randomString(50);
		const banner_url = `https://example.com/${randomString(10)}.jpg`;
		const user_id = users[Math.floor(Math.random() * users.length)].id;
		const now = new Date().toISOString();
		db.run(
			'INSERT INTO universe (name, description, banner_url, user_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
			name,
			description,
			banner_url,
			user_id,
			now,
			now,
		);
	}

	// Récupérer les univers pour les personnages
	const universes = db.prepare('SELECT id FROM universe').all();

	// Générer des personnages
	for (let i = 0; i < 20; i++) {
		const name = randomString(10);
		const description = randomString(50);
		const avatar_url = `https://example.com/${randomString(10)}.jpg`;
		const univer_id =
			universes[Math.floor(Math.random() * universes.length)].id;
		const now = new Date().toISOString();
		db.run(
			'INSERT INTO character (name, description, avatar_url, univer_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
			name,
			description,
			avatar_url,
			univer_id,
			now,
			now,
		);
	}
};

generateFakeData();
consola.info('Fake data generated');

// TODO: rename fixtures
