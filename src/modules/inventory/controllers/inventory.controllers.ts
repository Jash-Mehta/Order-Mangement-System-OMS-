import { Request, Response } from "express";
import { InventoryServices } from "../services/inventory.services";
import { ResponseUtil } from "../../../utils/response.util";


export class InventoryControllers{
    constructor(private inventoryServices: InventoryServices){}

    createInventory = async (req:Request, res: Response) => {
        try {
            const payload = await this.inventoryServices.createInventory(req.body);
            ResponseUtil.created(res, payload, 'Inventory item created successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to create inventory item', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    findProductId = async (req:Request, res: Response) => {
        try {
            const payload = await this.inventoryServices.findProductById(req.params.id);
            if (!payload) {
                ResponseUtil.notFound(res, 'Product not found', `No product found with ID: ${req.params.id}`);
                return;
            }
            ResponseUtil.success(res, payload, 'Product retrieved successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to retrieve product', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    createInventoryReservation = async (req:Request, res: Response) => {
        try {
            const payload = await this.inventoryServices.createInventoryReservation(req.body);
            ResponseUtil.created(res, payload, 'Inventory reservation created successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to create inventory reservation', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    createReservationsForOrder = async (req:Request, res: Response) => {
        try {
            const payload = await this.inventoryServices.createReservationsForOrder(req.body);
            ResponseUtil.created(res, payload, 'Order reservations created successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to create order reservations', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    cleanupExpiredReservations = async (req:Request, res: Response) => {
        try {
            const data = await this.inventoryServices.getAllReservation();
            ResponseUtil.success(res, data, 'Expired reservations cleaned up successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to cleanup expired reservations', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    getAllReservation = async (req: Request, res: Response) => {
        try {
            const data = await this.inventoryServices.getAllReservation();
            ResponseUtil.success(res, data, 'Reservations retrieved successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to retrieve reservations', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    getAllInventoryProduct = async (req: Request, res: Response) => {
        try {
            const data = await this.inventoryServices.getAllInventory();
            ResponseUtil.success(res, data, 'Inventory products retrieved successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to retrieve inventory products', error instanceof Error ? error.message : 'Unknown error');
        }
    }
}