import { Server } from '../server/index';
import { authRouter } from './auth';
import { characterRouter } from './character';
import { universeRouter } from './universe';
import { userRouter } from './user';

const router = new Server();

router.use(authRouter);
router.use(userRouter);
router.use(universeRouter);
router.use(characterRouter);

export default router;
