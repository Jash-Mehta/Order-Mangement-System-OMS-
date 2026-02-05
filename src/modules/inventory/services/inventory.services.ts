import { Inventory, InventoryRepositories, InventoryReservation, NewInventoryReservation } from "../repositories/inventory.repositories";
import { InventoryReservationTypeTable } from "../types/inventory.type";

export class InventoryServices {
    constructor(private inventoryRepo: InventoryRepositories) { }

    async createInventory(input: {
        name: string;
        brand_name?: string;
        bar_code?: string;
        image_url?: string;
        price: number; // numeric(12,2) in DB
        batch_no?: string;
        mfg_date?: Date;
        expiry_date?: Date;
        total_quantity: number;
        available_quantity: number;
    }) {
        return await this.inventoryRepo.createInventory(input);
    }

    async findProductById(id: string): Promise<Inventory | null> {
        return await this.inventoryRepo.findProductById(id);
    }

    async getAllInventory(): Promise<Inventory[]>{
        return await this.inventoryRepo.getAllInventoryProduct();
    }
    async createInventoryReservation(input: InventoryReservationTypeTable): Promise<InventoryReservation> {
        // Check if product exists and has enough quantity
        const inventory = await this.inventoryRepo.findProductById(input.product_id);

        await this.inventoryRepo.removeQtyFromInventory(input.product_id, input.quantity);
        const allProductId = await this.inventoryRepo.findProductIdByOrderId(input.order_id);

        if (!inventory) {
            throw new Error(`Product with ID ${input.product_id} not found`);
        }

        if (inventory.available_quantity < input.quantity) {
            throw new Error(`Insufficient inventory. Available: ${inventory.available_quantity}, Requested: ${input.quantity}`);
        }

        // Set expiration to 10 minutes from now if not provided
        const reservationData = {
            ...input,
            expires_at: input.expires_at || new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now

        };

        return await this.inventoryRepo.createInventoryReservation(reservationData);
    }

    async getAllReservation(): Promise<InventoryReservation[]> {
        return await this.inventoryRepo.getAllReservation();
    }

    async createReservationsForOrder(input: {
        order_id: string;
        user_id: string;
    }): Promise<InventoryReservation[]> {
        // Get all product IDs for the order
        const orderProducts = await this.inventoryRepo.findProductIdByOrderId(input.order_id);

        if (!orderProducts || orderProducts.length === 0) {
            throw new Error(`No products found for order ${input.order_id}`);
        }

        const reservations: InventoryReservation[] = [];

        // Create reservation for each product
        for (const product of orderProducts) {
            // Get the quantity from order items
            const orderItem = await this.getOrderItemQuantity(input.order_id, product.product_id);

            const reservationData = {
                order_id: input.order_id,
                user_id: input.user_id,
                product_id: product.product_id,
                quantity: orderItem.quantity,
                expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
            };

            // Check inventory exists and has enough quantity
            const inventory = await this.inventoryRepo.findProductById(product.product_id);
            if (!inventory) {
                throw new Error(`Product with ID ${product.product_id} not found`);
            }

            if (inventory.available_quantity < orderItem.quantity) {
                throw new Error(`Insufficient inventory for product ${product.product_id}. Available: ${inventory.available_quantity}, Requested: ${orderItem.quantity}`);
            }

            // Subtract quantity from inventory
            const updatedInventory = await this.inventoryRepo.updateAvailableQuantity(product.product_id, -orderItem.quantity);
            if (!updatedInventory) {
                throw new Error('Failed to update inventory quantity');
            }

            // Create reservation
            const reservation = await this.inventoryRepo.createInventoryReservation(reservationData);
            reservations.push(reservation);

            console.log(`📦 Reserved ${orderItem.quantity} units of product ${product.product_id}. Available quantity: ${updatedInventory.available_quantity}`);
        }

        return reservations;
    }

    async getOrderItemQuantity(order_id: string, product_id: string): Promise<{ quantity: number }> {
        // This would need to be implemented - getting quantity from order items
        // For now, assuming quantity 1 as placeholder
        const result = await this.inventoryRepo.getOrderItemQuantity(order_id, product_id);
        return result || { quantity: 1 };
    }


}