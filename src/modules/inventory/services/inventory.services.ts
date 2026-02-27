import { Inventory, InventoryRepositories, InventoryReservation } from "../repositories/inventory.repositories";
import { InventoryReservationTypeTable } from "../types/inventory.type";

export class InventoryServices {
    constructor(private inventoryRepo: InventoryRepositories) { }

    async createInventory(input: {
        name: string;
        brand_name?: string;
        bar_code?: string;
        image_url?: string;
        price: number;
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

    async getAllInventory(): Promise<Inventory[]> {
        return await this.inventoryRepo.getAllInventoryProduct();
    }

    async createInventoryReservation(input: InventoryReservationTypeTable): Promise<InventoryReservation> {
        // Step 1: Validate first
        const inventory = await this.inventoryRepo.findProductById(input.product_id);

        if (!inventory) {
            throw new Error(`Product with ID ${input.product_id} not found`);
        }

        if (inventory.available_quantity < input.quantity) {
            throw new Error(`Insufficient inventory. Available: ${inventory.available_quantity}, Requested: ${input.quantity}`);
        }

        // Step 2: Deduct inventory
        const updated = await this.inventoryRepo.updateAvailableQuantity(input.product_id, -input.quantity);
        if (!updated) {
            throw new Error('Failed to update inventory — insufficient stock');
        }

        // Step 3: Update order status
        await this.inventoryRepo.updateOrderStatusByOrderId(input.order_id, 'RESERVED_INVENTORY');

        // Step 4: Create reservation
        const reservationData = {
            ...input,
            expires_at: input.expires_at || new Date(Date.now() + 10 * 60 * 1000),
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
        // Step 1: Get all products for this order
        const orderProducts = await this.inventoryRepo.findProductIdByOrderId(input.order_id);

        if (!orderProducts || orderProducts.length === 0) {
            throw new Error(`No products found for order ${input.order_id}`);
        }

        const reservations: InventoryReservation[] = [];

        // Step 2: Process each product
        for (const product of orderProducts) {
            // Get quantity from order items
            const orderItem = await this.getOrderItemQuantity(input.order_id, product.product_id);

            // Validate inventory exists and has enough stock
            const inventory = await this.inventoryRepo.findProductById(product.product_id);
            if (!inventory) {
                throw new Error(`Product with ID ${product.product_id} not found`);
            }

            if (inventory.available_quantity < orderItem.quantity) {
                throw new Error(
                    `Insufficient inventory for product ${product.product_id}. Available: ${inventory.available_quantity}, Requested: ${orderItem.quantity}`
                );
            }

            // Deduct inventory
            const updatedInventory = await this.inventoryRepo.updateAvailableQuantity(product.product_id, -orderItem.quantity);
            if (!updatedInventory) {
                throw new Error(`Failed to update inventory for product ${product.product_id}`);
            }

            // Create reservation
            const reservationData = {
                order_id: input.order_id,
                user_id: input.user_id,
                product_id: product.product_id,
                quantity: orderItem.quantity,
                expires_at: new Date(Date.now() + 10 * 60 * 1000),
            };

            const reservation = await this.inventoryRepo.createInventoryReservation(reservationData);
            reservations.push(reservation);

            console.log(`📦 Reserved ${orderItem.quantity} units of product ${product.product_id}. Remaining: ${updatedInventory.available_quantity}`);
        }

        // Step 3: Update order status ONCE after all products processed
        await this.inventoryRepo.updateOrderStatusByOrderId(input.order_id, 'RESERVED_INVENTORY');

        return reservations;
    }

    async getOrderItemQuantity(order_id: string, product_id: string): Promise<{ quantity: number }> {
        const result = await this.inventoryRepo.getOrderItemQuantity(order_id, product_id);
        if (!result) {
            throw new Error(`Order item not found for order ${order_id} and product ${product_id}`);
        }
        return result;
    }
}