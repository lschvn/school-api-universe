import { Router } from '../server/router';
import { authRouter } from './auth';
import { universeRouter } from './universe';

const router = new Router({ prefix: '/api' });

router.use(authRouter)
router.use(universeRouter)

export default router;