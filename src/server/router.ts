import type { Handler } from './index';

type RouterOptions = {
    prefix?: string;
}

export class Router {
    private routes: Map<string, Handler> = new Map();
    private prefix: string;

    constructor(options: RouterOptions = {}) {
        this.prefix = options.prefix || '';
    }

    private normalizePath(path: string): string {
        if (path !== '/' && path.endsWith('/')) {
            return path.slice(0, -1);
        }
        return path;
    }

    on(method: string, path: string, handler: Handler): void {
        const normalizedPath = this.normalizePath(path);
        const fullPath = this.prefix + normalizedPath;
        this.routes.set(`${method.toUpperCase()}:${fullPath}`, handler);
    }

    use(router: Router): void {
        const childRoutes = router.getRoutes();
        childRoutes.forEach((handler, key) => {
            const [method, path] = key.split(':');
            const normalizedPath = this.normalizePath(path);
            const fullPath = this.prefix + normalizedPath;
            this.routes.set(`${method}:${fullPath}`, handler);
        });
    }

    getRoutes(): Map<string, Handler> {
        return this.routes;
    }
}