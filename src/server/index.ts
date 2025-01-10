import express, { type Request, type Response } from 'express';
import consola from 'consola';

export type Handler = (ctx: { req: Request; res: Response; params?: Record<string, string> }) => Promise<any> | any;
export type HttpEvent = { req: Request; res: Response; params?: Record<string, string> };

export class Server {
    private static mainApp = express();
    public router = express.Router();
    private prefix: string;

    constructor(prefix = '') {
        this.prefix = prefix;
        Server.mainApp.use(express.json());
    }

    on(method: string, path: string, handler: Handler) {
        const normPath = path.startsWith('/') ? path : `/${path}`;
        const fullPath = `${this.prefix}${normPath}`;

        (this.router as any)[method.toLowerCase()](normPath, async (req: Request, res: Response) => {
            const start = performance.now();
            consola.start(`${method.toUpperCase()} ${fullPath}`);

            try {
                const result = await handler({ req, res, params: req.params });

                const duration = Math.round(performance.now() - start);
                consola.success(`${method.toUpperCase()} ${fullPath} - ${duration}ms \n`);

                if (result === undefined) return;
                typeof result === 'object' ? res.json(result) : res.send(String(result));
            } catch (error: any) {
                const duration = Math.round(performance.now() - start);
                consola.error({
                    message: `${method.toUpperCase()} ${fullPath} - ${error.message}`,
                    badge: true,
                    additional: `${duration}ms`
                });
                res.status(500).send(error.message);
            }
        });
    }

    use(subServer: Server) {
        this.router.use(subServer.prefix, subServer.router);
    }

    listen(port: number, callback?: () => void) {
        Server.mainApp.use(this.prefix, this.router);
        Server.mainApp.listen(port, () => callback?.());
    }
}