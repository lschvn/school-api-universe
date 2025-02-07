import consola from 'consola';
import { config } from './app.config';
import { Server } from './src/server/index';
import router from './src/routes';

export const app = new Server();

// use the router
app.use(router);

// call the public method to serve all files in the public folder
app.public();

// documentation at /reference
// http://localhost:3000/reference
app.scalar('/openapi.json');

app.on('GET', '/', (event) => {
	return {
		status: 200,
		message: 'Welcome to the Universe API',
	};
});

app.listen(config.port, () => {
	consola.success('Server is running on : http://localhost:' + config.port);
	consola.info('Press CTRL+C to stop the server');
	consola.info('Server running on ' + process.env.NODE_ENV + ' mode \n');
});
