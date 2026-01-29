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
}