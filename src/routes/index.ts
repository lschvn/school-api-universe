import { Server } from '../server/index';
import { authRouter } from './auth';
import { universeRouter } from './universe';

const router = new Server();

router.use(authRouter)
router.use(universeRouter)

export default router;