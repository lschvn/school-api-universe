import consola from "consola";
import { config } from "./app.config";
import { Server } from "./src/server/index";
import router from "./src/routes";

export const app = new Server();

app.on('GET', '/', (event) => {
    return {
        routes: Array.from(router.getRoutes().keys())
    }
})

app.listen(config.port, () => {
    consola.success('Server is running on : http://localhost:' + config.port);
    consola.info('Press CTRL+C to stop the server');
    consola.info('Server running on ' + process.env.NODE_ENV + ' mode \n');
})