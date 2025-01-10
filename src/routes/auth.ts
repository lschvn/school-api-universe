import { consola } from "consola";
import AuthController from "../app/controllers/auth";
import { Server } from "../server";
import { readBody } from "../server/utils/body";
import { createError, createResponse } from "../server/utils/http";
import { getUserSession, setUserSession } from "../server/utils/session";
import User from "../app/models/user";

export const authRouter = new Server('/api/auth');

/**
 * @api {post} /auth/login
 * @description Logs in a user with email and password
 *
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {object} - The user data
 */
authRouter.on('POST', '/login', async (event) => {
    const session = await getUserSession(event);
    if(session?.user) {
        return createError(event, {
            status: 403,
            message: 'User is already logged in'
        })
    }

    const body = await readBody(event) as { email: string, password: string };

    const result = AuthController.login(body.email, body.password);
    if(typeof result === 'string') {
        return createError(event, {
            status: 401,
            message: result
        })
    }

    const user = User.sanitize(result);

    await setUserSession(event, {
        user: {
            id: user.id,
            email: user.email
        },
        lastLoggedIn: new Date()
    });

    return createResponse(event, {
        status: 200,
        data: user,
        message: 'User logged in'
    })
})

/**
 * @api {post} /auth/signup
 * @description Signs up a user with name, email and password
 *
 * @param {string} name - The name of the user
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {object} - The user data
 */
authRouter.on('POST', '/signup', async (event) => {
    const session = await getUserSession(event);
    if(session?.user) {
        return createError(event, {
            status: 403,
            message: 'User is already logged in'
        })
    }

    const body = await readBody(event) as { name: string, email: string, password: string };

    const result = AuthController.signup(body.name, body.email, body.password);
    if(typeof result === 'string') {
        return createError(event, {
            status: 400,
            message: result
        })
    }

    await setUserSession(event, {
        user: User.sanitize(result),
        lastLoggedIn: new Date()
    });

    return createResponse(event, {
        status: 200,
        data: result,
        message: 'User signed up'
    })
})