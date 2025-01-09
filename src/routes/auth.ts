import AuthController from "../app/controllers/auth";
import { Router } from "../server/router";
import { readBody } from "../server/utils/body";
import { createError, createResponse } from "../server/utils/http";
import { getUserSession, setUserSession } from "../server/utils/session";

export const authRouter = new Router({ prefix: '/auth' });

authRouter.on('POST', '/login', async (event) => {
    const session = await getUserSession(event);
    if(session?.user) {
        return createError(event, {
            status: 403,
            message: 'User is already logged in'
        })
    }

    const body = await readBody(event) as { email: string, password: string };

    const user = AuthController.login(body.email, body.password);
    if(!user) {
        return createError(event, {
            status: 401,
            message: 'Invalid email or password'
        })
    }

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

authRouter.on('POST', '/signup', async (event) => {
    const session = await getUserSession(event);
    if(session?.user) {
        return createError(event, {
            status: 403,
            message: 'User is already logged in'
        })
    }

    const body = await readBody(event) as { name: string, email: string, password: string };

    const user = AuthController.signup(body.name, body.email, body.password);
    if(!user) {
        return createError(event, {
            status: 400,
            message: 'User already exists, please login'
        })
    }

    delete user.password;
    await setUserSession(event, {
        user,
        lastLoggedIn: new Date()
    });

    return createResponse(event, {
        status: 200,
        data: user,
        message: 'User signed up'
    })
})