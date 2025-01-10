import type { HttpEvent } from "..";

export function readBody(event: HttpEvent) {
    return new Promise((resolve, reject) => {
        let body = '';
        event.req.on('data', (chunk) => {
            body += chunk;
        });
        event.req.on('end', () => {
            resolve(JSON.parse(body));
        });
        event.req.on('error', (error) => {
            reject(error);
        });
    });
}