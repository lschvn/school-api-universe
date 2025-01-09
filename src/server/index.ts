import http, { IncomingMessage, ServerResponse } from 'http';
import type { Router } from './router';
import consola from 'consola';

export type Handler = (ctx: { req: IncomingMessage; res: ServerResponse }) => Promise<any> | any;
export type HttpEvent = { req: IncomingMessage; res: ServerResponse };

class Server {
    public routes: Map<string, Handler> = new Map();

    on(method: string, path: string, handler: Handler): void {
        this.routes.set(`${method.toUpperCase()}:${path}`, handler);
    }

    public use(router: Router): void {
        const routes = router.getRoutes();
        routes.forEach((handler, key) => {
            this.routes.set(key, handler);
        });
    }

    private normalizeUrl(url: string): string {
        if (url !== '/' && url.endsWith('/')) {
            return url.slice(0, -1);
        }
        return url;
    }

    private async handleRequest(req: IncomingMessage, res: ServerResponse) {
        const url = req.url ? this.normalizeUrl(req.url) : '/';
        const method = req.method?.toUpperCase() || 'GET';
        const requestId = `${method} ${url}`;

        consola.start({ message: requestId });
        const start = performance.now();

        let handler: Handler | null = null;
        for (const [routeKey, routeHandler] of this.routes.entries()) {
            const [routeMethod, routePath] = routeKey.split(':');
            if (routeMethod === method && url === routePath) {
                handler = routeHandler;
                break;
            }
        }

        if (!handler) {
            res.statusCode = 404;
            consola.warn({ message: `${requestId} - Not Found` });
            res.end('Not Found');
            return;
        }

        try {
            const result = await handler({ req, res });
            const end = performance.now();
            const duration = end - start;

            const timeStr = duration > 1000
                ? `${(duration/1000).toFixed(2)}s`
                : `${Math.round(duration)}ms`;

            consola.success({ message: `${requestId} took ${timeStr} \n` });

            if (result !== undefined) {
                if (typeof result === 'object') {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(result));
                } else {
                    res.setHeader('Content-Type', 'text/plain');
                    res.end(result.toString());
                }
            }
        } catch (error: any) {
            consola.error({ message: `${requestId} - ${error.message}` });
            res.statusCode = 500;
            res.end(`Server Error: ${error.message}`);
        }
    }

    listen(port: number, callback?: () => void) {
        const server = http.createServer(this.handleRequest.bind(this));
        server.listen(port, callback);
    }
}

export default Server;