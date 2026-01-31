import * as cron from 'node-cron';
import { container } from '../DI/container';

export class InventoryCronService {
    private static instance: InventoryCronService;
    private cleanupTask: cron.ScheduledTask | null = null;

    private constructor() {}

    static getInstance(): InventoryCronService {
        if (!InventoryCronService.instance) {
            InventoryCronService.instance = new InventoryCronService();
        }
        return InventoryCronService.instance;
    }

    startCleanupCron(): void {
        // Run every minute to check for expired reservations
        this.cleanupTask = cron.schedule('* * * * *', async () => {
            try {
                console.log('🔄 Running inventory reservation cleanup check...');
                
                const allReservations = await container.inventoryServices.getAllReservation();
                const currentTime = new Date();
                
                const expiredProductIds = new Set<string>();
                
                // Check each reservation for expiration
                for (const reservation of allReservations) {
                    if (new Date(reservation.expires_at) <= currentTime) {
                        expiredProductIds.add(reservation.product_id);
                        console.log(`⏰ Reservation ${reservation.id} for product ${reservation.product_id} has expired`);
                    }
                }
                
                
                if (expiredProductIds.size > 0) {
                    console.log(`🗑️  Releasing reservations for ${expiredProductIds.size} products`);
                    
                    for (const productId of expiredProductIds) {
                        try {
                            await container.inventoryRepo.releaseReservation(productId);
                            console.log(`♻️  Released expired reservations for product ${productId}`);
                        } catch (error) {
                            console.error(`❌ Failed to release reservations for product ${productId}:`, error);
                        }
                    }
                } else {
                    console.log(`🗑️  Releasing reservations for ${expiredProductIds.size} products`);
                    console.log('✅ No expired inventory reservations found');
                }
                
            } catch (error) {
                console.error('❌ Error during inventory reservation cleanup:', error);
            }
        }, {
            
            timezone: 'UTC'
        });

        console.log('⏰ Inventory reservation cleanup cron job started (runs every minute)');
    }

    stopCleanupCron(): void {
        if (this.cleanupTask) {
            this.cleanupTask.stop();
            this.cleanupTask = null;
            console.log('⏹️  Inventory reservation cleanup cron job stopped');
        }
    }
}
