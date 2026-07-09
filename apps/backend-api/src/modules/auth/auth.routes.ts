import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler';
import { requireAuth } from './auth.middleware';
import { loginController, meController, registerController } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(registerController));
authRouter.post('/login', asyncHandler(loginController));
authRouter.get('/me', requireAuth, asyncHandler(meController));
