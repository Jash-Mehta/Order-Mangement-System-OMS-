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
        this.cleanupTask = cron.schedule('*/5 * * * *', async () => {
            try {
                console.log('🔄 Running inventory reservation cleanup check...');

                if (!container.inventoryServices || !container.inventoryRepo) {
                    console.log('⚠️  Inventory services not available, skipping cleanup');
                    return;
                }

                const allReservations = await container.inventoryServices.getAllReservation();
                const currentTime = new Date();

                const expiredReservations = allReservations.filter(
                    reservation => new Date(reservation.expires_at) <= currentTime
                );

                if (expiredReservations.length > 0) {
                    console.log(`🗑️  Releasing ${expiredReservations.length} expired reservations`);

                    for (const reservation of expiredReservations) {
                        try {
                            await container.inventoryRepo.releaseReservation(reservation.product_id);
                            await container.inventoryRepo.updateOrderStatusByOrderId(reservation.order_id, 'CANCELLED');
                            console.log(`♻️  Released expired reservation ${reservation.id} for product ${reservation.product_id}`);
                        } catch (error) {
                            console.error(`❌ Failed to release reservation ${reservation.id}:`, error);
                        }
                    }
                } else {
                    console.log('✅ No expired inventory reservations found');
                }

            } catch (error) {
                console.error('❌ Error during inventory reservation cleanup:', error);
            }
        }, {
            timezone: 'UTC'
        });

        console.log('⏰ Inventory reservation cleanup cron job started (runs every 5 minutes)');
    }

    stopCleanupCron(): void {
        if (this.cleanupTask) {
            this.cleanupTask.stop();
            this.cleanupTask = null;
            console.log('⏹️  Inventory reservation cleanup cron job stopped');
        }
    }
}