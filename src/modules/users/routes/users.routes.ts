import { Router } from 'express';
import { container } from '../../../DI/container';

export const userRouter = Router();

userRouter.post('/create', container.userControllers.createUser);
userRouter.post('/login', container.userControllers.loginUser);
userRouter.get('/all', container.userControllers.getAllUsers);