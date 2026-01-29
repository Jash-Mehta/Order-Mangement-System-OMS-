import { InventoryControllers } from "../modules/inventory/controllers/inventory.controllers";
import { InventoryRepositories } from "../modules/inventory/repositories/inventory.repositories";
import { InventoryServices } from "../modules/inventory/services/inventory.services";
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

// Inventory Repo
const inventoryRepo = new InventoryRepositories();
const inventoryServices = new InventoryServices(inventoryRepo);
const inventoryControllers = new InventoryControllers(inventoryServices);


export const container = {
  orderController,
  userControllers,
  inventoryControllers,
};