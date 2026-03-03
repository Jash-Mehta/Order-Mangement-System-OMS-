import { ColumnType, Generated, Insertable, Selectable } from 'kysely';

// ─── Shipments ────────────────────────────────────────────────────────────────

export interface ShipmentsTable {
  id: Generated<string>;
  order_id: string;
  customer_id: string;

  
  courier_name: string | null;
  tracking_number: string | null;
  courier_order_id: string | null;   
  awb_number: string | null;         

 
  status: ColumnType<ShipmentStatus, ShipmentStatus, ShipmentStatus>;

 
  dispatched_at: Date | null;
  in_transit_at: Date | null;
  out_for_delivery_at: Date | null;
  delivered_at: Date | null;
  returned_at: Date | null;
  failed_at: Date | null;

 
  pickup_name: string | null;
  pickup_phone: string | null;
  pickup_address: string | null;
  pickup_city: string | null;
  pickup_state: string | null;
  pickup_pincode: string | null;


  delivery_name: string | null;
  delivery_phone: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
  delivery_pincode: string | null;
  delivery_country: string | null;

  notes: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}



export interface ShipmentItemsTable {
  id: Generated<string>;
  shipment_id: string;
  order_item_id: string;
  product_id: string;
  product_name: string | null;
  quantity: number;
  status: ColumnType<ShipmentItemStatus, ShipmentItemStatus, ShipmentItemStatus>;

  returned_at: Date | null;
  return_reason: string | null;
  damaged_at: Date | null;
  damage_notes: string | null;

  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// ─── Shipment Tracking ────────────────────────────────────────────────────────

export interface ShipmentTrackingTable {
  id: Generated<string>;
  shipment_id: string;
  status: string;
  message: string | null;    // e.g. "Package picked up from warehouse"
  location: string | null;   // e.g. "Mumbai Hub"
  happened_at: Generated<Date>;
  created_at: Generated<Date>;
}



export type ShipmentStatus =
  | 'PENDING'          
  | 'DISPATCHED'       
  | 'IN_TRANSIT'       
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED'       
  | 'FAILED'          
  | 'RETURNED';         

export type ShipmentItemStatus =
  | 'PENDING'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'RETURNED'
  | 'DAMAGED';



export interface ShipmentDatabase {
  shipments: ShipmentsTable;
  shipment_items: ShipmentItemsTable;
  shipment_tracking: ShipmentTrackingTable;
}