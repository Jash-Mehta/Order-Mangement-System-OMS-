import { Request, Response } from "express";
import { InventoryServices } from "../services/inventory.services";


export class InventoryControllers{
    constructor(private inventoryServices: InventoryServices){}

    createInventory = async (req:Request, res: Response) => {
        const payload = await this.inventoryServices.createInventory(req.body);
        res.status(201).json(payload);
    }

    findProductId = async (req:Request, res: Response) => {
        const payload = await this.inventoryServices.findProductById(req.params.id);
        if (!payload) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json(payload);
    }

    createInventoryReservation = async (req:Request, res: Response) => {
        const payload = await this.inventoryServices.createInventoryReservation(req.body);
        res.status(201).json(payload);
    }

    createReservationsForOrder = async (req:Request, res: Response) => {
        const payload = await this.inventoryServices.createReservationsForOrder(req.body);
        res.status(201).json(payload);
    }

    cleanupExpiredReservations = async (req:Request, res: Response) => {
        const data = await this.inventoryServices.getAllReservation();
        res.status(200).json(data);
    }

    getAllReservation = async (req: Request, res: Response) => {
        const data = await this.inventoryServices.getAllReservation();
        res.status(200).json(data);
    }

    getAllInventoryProduct = async (req: Request, res: Response) => {
        const data = await this.inventoryServices.getAllInventory();
        res.status(200).json(data);
    }
}