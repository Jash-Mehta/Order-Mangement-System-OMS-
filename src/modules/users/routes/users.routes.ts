const {Router} = require('express');
import { container } from '../../../DI/container';
export const userRouter = Router();

userRouter.post('/create', container.userControllers.createUser);
userRouter.post('/login', container.userControllers.loginUser);