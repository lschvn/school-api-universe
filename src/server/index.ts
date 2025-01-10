import express, { type Request, type Response } from 'express';
import consola from 'consola';

export type Handler = (ctx: { req: Request; res: Response; params?: Record<string, string> }) => Promise<any> | any;
export type HttpEvent = { req: Request; res: Response; params?: Record<string, string> };

export class Server {
    private static app = express();
    private routes = new Map<string, Handler>();
    private prefix: string;
    private router = express.Router();

    constructor(prefix: string = '') {
        this.prefix = prefix;
        if (!Server.app._router) {
            Server.app.use(express.json());
        }
        Server.app.use(this.prefix, this.router);
    }

    on(method: string, path: string, handler: Handler) {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        const key = `${method.toUpperCase()}:${this.prefix}${normalizedPath}`;

        this.routes.set(key, handler);

        (this.router as any)[method.toLowerCase()](normalizedPath, async (req: Request, res: Response) => {
            try {
                const result = await handler({
                    req,
                    res,
                    params: req.params,
                });

                if (result === undefined) return;

                if (typeof result === 'object') {
                    res.json(result);
                } else {
                    res.send(String(result));
                }
            } catch (error: any) {
                consola.error(error);
                res.status(500).send(error.message);
            }
        });
    }

    use(server: Server) {
        server.getRoutes().forEach((handler, key) => {
            const [method, path] = key.split(':');
            const routePath = path.replace(server.prefix, '');
            this.on(method, routePath, handler);
        });
    }

    getRoutes() {
        return this.routes;
    }

    listen(port: number, callback?: () => void) {
        return Server.app.listen(port, () => {
            if (callback) {
                callback();
            }
        });
    }
}