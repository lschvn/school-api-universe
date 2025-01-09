import type { HttpEvent } from "../index";
import crypto from 'crypto';
import type User from "../../app/models/user";
import { config } from "../../../app.config";
import jwt from "jsonwebtoken";

const JWT_SECRET_KEY = process.env.JWT_SECRET || 'test_dev_key' as string;

type UserSession = {
    user: Partial<User>;
    [key: string]: any;
}

export async function setUserSession(
    event: HttpEvent,
    data: UserSession
): Promise<void> {
    if (!JWT_SECRET_KEY) {
        throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }

    const token = jwt.sign(data, JWT_SECRET_KEY, { expiresIn: '1h' });

    const cookieParts = [
        `${config.cookie.name}=${token}`,
        'Path=/',
    ];

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

export async function getUserSession(event: HttpEvent): Promise<UserSession | void> {
    if (!JWT_SECRET_KEY) {
        throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }
    const cookieHeader = event.req.headers['cookie'];
    if(!cookieHeader) { return }

    const cookies = Object.fromEntries(
        cookieHeader.split('; ').map((cookie) => {
            const [key, value] = cookie.split('=');
            return [key, value];
        })
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

function setupSecretKey() {
    if(process.env.NODE_ENV === 'development') {
        return Buffer.from([180, 84, 59, 66, 232, 99, 238, 139, 209, 62, 99, 152, 106, 205, 85, 82, 185, 12, 154, 130, 19, 40, 131, 224, 61, 226, 49, 85, 109, 62, 73, 10])
    }
    if (process.env.NODE_ENV === 'production') {
        return crypto.randomBytes(32);
    }
}

const SECRET_KEY = setupSecretKey();
const IV_LENGTH = 16;

export function encryptPassword(password: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptPassword(encryptedPassword: string): string {
    console.log("encryptedPassword", encryptedPassword)
    const [ivHex, encryptedHex] = encryptedPassword.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    console.log("iv", iv)
    const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, iv);
    console.log("decipher", decipher)
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}