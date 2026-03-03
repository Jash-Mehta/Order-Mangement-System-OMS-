import { ShipmentRepository } from '../repositories/shipment.repositories'
import { ShipmentStatus } from '../schema/shipment.schema';

export class ShipmentService {

  constructor(
    private readonly shipmentRepo: ShipmentRepository = new ShipmentRepository()
  ) { }
  async createShipment(input: {
    order_id: string;
    customer_id: string;
    items: Array<{
      order_item_id: string;
      product_id: string;
      product_name: string;
      quantity: number;
    }>;
    delivery: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    pickup?: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    notes?: string;
  }) {
    
    const existing = await this.shipmentRepo.getByOrderId(input.order_id);
    if (existing) {
      throw new Error(`Shipment already exists for order ${input.order_id}`);
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('At least one item is required to create a shipment');
    }

    
    const shipment = await this.shipmentRepo.create({
      order_id: input.order_id,
      customer_id: input.customer_id,
      status: 'PENDING',

      
      delivery_name: input.delivery.name,
      delivery_phone: input.delivery.phone,
      delivery_address: input.delivery.address,
      delivery_city: input.delivery.city,
      delivery_state: input.delivery.state,
      delivery_pincode: input.delivery.pincode,
      delivery_country: input.delivery.country,


      pickup_name: input.pickup?.name ?? null,
      pickup_phone: input.pickup?.phone ?? null,
      pickup_address: input.pickup?.address ?? null,
      pickup_city: input.pickup?.city ?? null,
      pickup_state: input.pickup?.state ?? null,
      pickup_pincode: input.pickup?.pincode ?? null,

      notes: input.notes ?? null,

      
      courier_name: null,
      tracking_number: null,
      courier_order_id: null,
      awb_number: null,
    });

    
    const items = [];
    for (const item of input.items) {
      const shipmentItem = await this.shipmentRepo.createItem({
        shipment_id: shipment.id,
        order_item_id: item.order_item_id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        status: 'PENDING',
      });
      items.push(shipmentItem);
    }

    
    await this.shipmentRepo.addTrackingEvent({
      shipment_id: shipment.id,
      status: 'PENDING',
      message: 'Shipment created and awaiting dispatch',
      location: null,
    });

    return { shipment, items };
  }

  // ─── Dispatch ──────────────────────────────────────────────────────────────
  // Admin action: assigns courier, sets DISPATCHED

  async dispatchShipment(shipment_id: string, courierInfo: {
    courier_name: string;
    tracking_number: string;
    courier_order_id?: string;
    awb_number?: string;
    notes?: string;
  }) {
    const shipment = await this.getShipmentOrThrow(shipment_id);

    if (shipment.status !== 'PENDING') {
      throw new Error(`Cannot dispatch shipment with status: ${shipment.status}. Must be PENDING`);
    }

    
    await this.shipmentRepo.updateCourierInfo(shipment_id, courierInfo);

    
    const updated = await this.shipmentRepo.updateStatus(shipment_id, 'DISPATCHED', {
      dispatched_at: new Date(),
    });

    
    await this.shipmentRepo.updateAllItemsStatus(shipment_id, 'DISPATCHED');

    
    await this.shipmentRepo.updateOrderStatus(shipment.order_id, 'DISPATCHED');
    await this.shipmentRepo.updateOrderItemsStatus(shipment.order_id, 'DISPATCHED');

    
    await this.shipmentRepo.addTrackingEvent({
      shipment_id,
      status: 'DISPATCHED',
      message: `Dispatched via ${courierInfo.courier_name}. Tracking: ${courierInfo.tracking_number}`,
      location: courierInfo.notes ?? null,
    });

    return updated;
  }

  // ─── Status transitions (admin) ────────────────────────────────────────────

  async markInTransit(shipment_id: string, location?: string) {
    return await this.transitionStatus(shipment_id, 'IN_TRANSIT', 'DISPATCHED', {
      timestamps: { in_transit_at: new Date() },
      trackingMessage: 'Package is in transit',
      location,
    });
  }

  async markOutForDelivery(shipment_id: string, location?: string) {
    return await this.transitionStatus(shipment_id, 'OUT_FOR_DELIVERY', 'IN_TRANSIT', {
      timestamps: { out_for_delivery_at: new Date() },
      trackingMessage: 'Package is out for delivery',
      location,
    });
  }

  async markDelivered(shipment_id: string, location?: string) {
    const shipment = await this.getShipmentOrThrow(shipment_id);

    const updated = await this.transitionStatus(shipment_id, 'DELIVERED', 'OUT_FOR_DELIVERY', {
      timestamps: { delivered_at: new Date() },
      trackingMessage: 'Package delivered successfully',
      location,
    });

    
    await this.shipmentRepo.updateAllItemsStatus(shipment_id, 'DELIVERED');
    await this.shipmentRepo.updateOrderStatus(shipment.order_id, 'DELIVERED');
    await this.shipmentRepo.updateOrderItemsStatus(shipment.order_id, 'DELIVERED');

    return updated;
  }

  async markFailed(shipment_id: string, reason?: string) {
    const shipment = await this.getShipmentOrThrow(shipment_id);

    if (!['OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(shipment.status)) {
      throw new Error(`Cannot mark failed from status: ${shipment.status}`);
    }

    const updated = await this.shipmentRepo.updateStatus(shipment_id, 'FAILED', {
      failed_at: new Date(),
    });

    await this.shipmentRepo.updateOrderStatus(shipment.order_id, 'DELIVERY_FAILED');

    await this.shipmentRepo.addTrackingEvent({
      shipment_id,
      status: 'FAILED',
      message: reason ?? 'Delivery attempt failed',
      location: null,
    });

    return updated;
  }

  async markReturned(shipment_id: string, reason?: string) {
    const shipment = await this.getShipmentOrThrow(shipment_id);

    if (!['FAILED', 'DISPATCHED', 'IN_TRANSIT'].includes(shipment.status)) {
      throw new Error(`Cannot mark returned from status: ${shipment.status}`);
    }

    const updated = await this.shipmentRepo.updateStatus(shipment_id, 'RETURNED', {
      returned_at: new Date(),
    });

    await this.shipmentRepo.updateAllItemsStatus(shipment_id, 'RETURNED');
    await this.shipmentRepo.updateOrderStatus(shipment.order_id, 'RETURNED');
    await this.shipmentRepo.updateOrderItemsStatus(shipment.order_id, 'RETURNED');

    await this.shipmentRepo.addTrackingEvent({
      shipment_id,
      status: 'RETURNED',
      message: reason ?? 'Package returned to warehouse',
      location: null,
    });

    return updated;
  }

  // ─── Item-level actions ────────────────────────────────────────────────────

  async returnItem(shipment_id: string, item_id: string, reason: string) {
    await this.getShipmentOrThrow(shipment_id);

    return await this.shipmentRepo.updateItemStatus(item_id, 'RETURNED', {
      returned_at: new Date(),
      return_reason: reason,
    });
  }

  async markItemDamaged(shipment_id: string, item_id: string, notes: string) {
    await this.getShipmentOrThrow(shipment_id);

    return await this.shipmentRepo.updateItemStatus(item_id, 'DAMAGED', {
      damaged_at: new Date(),
      damage_notes: notes,
    });
  }

  // ─── Tracking ──────────────────────────────────────────────────────────────

  async addTrackingEvent(shipment_id: string, data: {
    status: string;
    message?: string;
    location?: string;
  }) {
    await this.getShipmentOrThrow(shipment_id);

    return await this.shipmentRepo.addTrackingEvent({
      shipment_id,
      status: data.status,
      message: data.message ?? null,
      location: data.location ?? null,
    });
  }

  async getTrackingHistory(shipment_id: string) {
    await this.getShipmentOrThrow(shipment_id);
    return await this.shipmentRepo.getTrackingHistory(shipment_id);
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  async getShipmentById(id: string) {
    return await this.getShipmentOrThrow(id);
  }

  async getShipmentByOrderId(order_id: string) {
    const shipment = await this.shipmentRepo.getByOrderId(order_id);
    if (!shipment) throw new Error(`No shipment found for order: ${order_id}`);
    return shipment;
  }

  async getMyShipments(customer_id: string) {
    return await this.shipmentRepo.getByCustomerId(customer_id);
  }

  async getShipmentItems(shipment_id: string) {
    await this.getShipmentOrThrow(shipment_id);
    return await this.shipmentRepo.getItemsByShipmentId(shipment_id);
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async getShipmentOrThrow(id: string) {
    const shipment = await this.shipmentRepo.getById(id);
    if (!shipment) throw new Error(`Shipment not found: ${id}`);
    return shipment;
  }

  
  private async transitionStatus(
    shipment_id: string,
    to: ShipmentStatus,
    requiredFrom: ShipmentStatus,
    options: {
      timestamps?: Record<string, Date>;
      trackingMessage: string;
      location?: string;
    }
  ) {
    const shipment = await this.getShipmentOrThrow(shipment_id);

    if (shipment.status !== requiredFrom) {
      throw new Error(`Cannot move to ${to} from status: ${shipment.status}. Expected: ${requiredFrom}`);
    }

    const updated = await this.shipmentRepo.updateStatus(shipment_id, to, options.timestamps);

    await this.shipmentRepo.addTrackingEvent({
      shipment_id,
      status: to,
      message: options.trackingMessage,
      location: options.location ?? null,
    });

    return updated;
  }
}