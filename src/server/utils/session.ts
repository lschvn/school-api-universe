import type { HttpEvent } from '../index';
import crypto from 'crypto';
import type User from '../../app/models/user';
import { config } from '../../../app.config';
import jwt from 'jsonwebtoken';
import consola from 'consola';

const JWT_SECRET_KEY = process.env.JWT_SECRET || ('test_dev_key' as string);

type UserSession = {
	user: Partial<User>;
	[key: string]: any;
};

export async function setUserSession(
	event: HttpEvent,
	data: UserSession,
): Promise<void> {
	if (!JWT_SECRET_KEY) {
		throw new Error('JWT_SECRET_KEY is not defined in environment variables');
	}

	const token = jwt.sign(data, JWT_SECRET_KEY, { expiresIn: '1h' });

	const cookieParts = [`${config.cookie.name}=${token}`, 'Path=/'];

	if (config.cookie.httpOnly) {
		cookieParts.push('HttpOnly');
	}
	if (config.cookie.secure) {
		cookieParts.push('Secure');
	}
	if (config.cookie.sameSite) {
		cookieParts.push(`SameSite=${config.cookie.sameSite}`);
	}
	if (config.cookie.maxAge) {
		cookieParts.push(`Max-Age=${Math.floor(config.cookie.maxAge / 1000)}`);
	}

	const cookie = cookieParts.join('; ');
	event.res.setHeader('Set-Cookie', cookie);
}

export async function getUserSession(
	event: HttpEvent,
): Promise<UserSession | void> {
	if (!JWT_SECRET_KEY) {
		throw new Error('JWT_SECRET_KEY is not defined in environment variables');
	}
	const cookieHeader = event.req.headers['cookie'];
	if (!cookieHeader) {
		return;
	}

	const cookies = Object.fromEntries(
		cookieHeader.split('; ').map((cookie) => {
			const [key, value] = cookie.split('=');
			return [key, value];
		}),
	);

	const token = cookies[config.cookie.name];
	if (!token) {
		return;
	}

	try {
		const payload = jwt.verify(token, JWT_SECRET_KEY) as UserSession;
		return payload;
	} catch {
		return;
	}
}

function setupSecretKey(): Buffer {
	if (!process.env.NODE_ENV) {
		throw new Error('NODE_ENV must be defined');
	}

	if (process.env.NODE_ENV === 'development') {
		return Buffer.from([
			180, 84, 59, 66, 232, 99, 238, 139, 209, 62, 99, 152, 106, 205, 85, 82,
			185, 12, 154, 130, 19, 40, 131, 224, 61, 226, 49, 85, 109, 62, 73, 10,
		]);
	}

	return crypto.randomBytes(32);
}

const SECRET_KEY = setupSecretKey();
const IV_LENGTH = 16;

export function encryptPassword(password: string): string {
	if (!SECRET_KEY || !(SECRET_KEY instanceof Buffer)) {
		throw new Error('Invalid SECRET_KEY configuration');
	}

	if (!password || typeof password !== 'string') {
		throw new Error('Password must be a non-empty string');
	}

	try {
		const iv = crypto.randomBytes(IV_LENGTH);
		const secretKeyArray = new Uint8Array(SECRET_KEY);
		const cipher = crypto.createCipheriv('aes-256-cbc', secretKeyArray, iv);
		let encrypted = cipher.update(password, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return `${iv.toString('hex')}:${encrypted}`;
	} catch (error: any) {
		consola.error('Encryption error:', error.message, {
			password: !!password,
			secretKey: !!SECRET_KEY,
		});
		throw new Error('Failed to encrypt password');
	}
}

export function decryptPassword(encryptedPassword: string): string {
	if (!SECRET_KEY || !(SECRET_KEY instanceof Buffer)) {
		throw new Error('Invalid SECRET_KEY configuration');
	}

	if (!encryptedPassword || typeof encryptedPassword !== 'string') {
		throw new Error('Encrypted password must be a non-empty string');
	}
	const [ivHex, encryptedHex] = encryptedPassword.split(':');
	console.log('Decrypting password with IV:', ivHex);
	if (!ivHex || !encryptedHex) {
		throw new Error('Invalid encrypted password format');
	}
	const iv = Buffer.from(ivHex, 'hex');
	console.log('Creating decipher with:', {
		ivLength: iv.length,
		secretKeyLength: SECRET_KEY.length,
		encryptedHexLength: encryptedHex.length,
	});
	const secretKeyArray = new Uint8Array(SECRET_KEY);
	const decipher = crypto.createDecipheriv('aes-256-cbc', secretKeyArray, iv);
	let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	console.log('Password decrypted successfully');
	return decrypted;
}
