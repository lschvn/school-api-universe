import { Router } from '../server/router';
import { authRouter } from './auth';

const router = new Router({ prefix: '/api' });

router.use(authRouter)

export default router;