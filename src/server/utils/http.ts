import type { HttpEvent } from "..";

type ErrorOptions = {
    status: number;
    message: string;
};

export function createError(event: HttpEvent, { status, message }: ErrorOptions) {
    event.res.setHeader('Content-Type', 'application/json');
    event.res.statusCode = status;
    return {
        status,
        message,
    };
}

type ResponseOptions = {
    data: any;
    status: number;
    message?: string;
}

export function createResponse(event: HttpEvent, { data, status, message }: ResponseOptions) {
    event.res.setHeader('Content-Type', 'application/json');
    event.res.statusCode = status;
    return {
        status,
        message,
        data,
    };
}

export function getRouterParam(event: HttpEvent, param: string): string | undefined {
    return event.params?.[param];
}

export function getRouterParams(event: HttpEvent, params: string[]): Record<string, string | undefined> {
    const result: Record<string, string | undefined> = {};
    for (const name of params) {
        result[name] = event.params?.[name];
    }
    return result;
}