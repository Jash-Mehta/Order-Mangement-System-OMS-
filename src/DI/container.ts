import { OrderController } from "../modules/order/controllers/order.controller";
import { OrderRepository } from "../modules/order/repositories/order.repository";
import { OrderService } from "../modules/order/services/order.service";
import { UserControllers } from "../modules/users/controllers/users.controllers";
import { UsersRepositories } from "../modules/users/repositories/users.repositories";
import { UserServices } from "../modules/users/services/users.services";

// src/container.ts
const orderRepo = new OrderRepository();
const orderService = new OrderService(orderRepo);
const orderController = new OrderController(orderService);
// User Repo
const userRepo = new UsersRepositories();
const userServices = new UserServices(userRepo);
const userControllers = new UserControllers(userServices);


export const container = {
  orderController,
  userControllers,
};