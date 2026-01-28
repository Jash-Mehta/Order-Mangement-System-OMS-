import express from 'express';

import { orderRouter,userRouter } from './modules/index';
import dotenv from 'dotenv';

export function createApp() {
  dotenv.config();

  const app = express();

  app.use(express.json());

  app.use('/orders', orderRouter);
  app.use('/users',userRouter);
  

  return app;
}
