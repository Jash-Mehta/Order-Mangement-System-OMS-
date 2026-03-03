import { Request, Response } from 'express';
import { ShipmentService } from '../services/shipment.services'
import { ResponseUtil } from '../../../utils/response.util';

export class ShipmentController {

  constructor(private readonly shipmentService: ShipmentService) { }

  // ─── Create ────────────────────────────────────────────────────────────────

  createShipment = async (req: Request, res: Response) => {
    try {
      const result = await this.shipmentService.createShipment(req.body);
      ResponseUtil.created(res, result, 'Shipment created successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to create shipment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // ─── Getters ───────────────────────────────────────────────────────────────

  getShipmentById = async (req: Request, res: Response) => {
    try {
      const shipment = await this.shipmentService.getShipmentById(req.params.id);
      ResponseUtil.success(res, shipment, 'Shipment retrieved successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to retrieve shipment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  getShipmentByOrderId = async (req: Request, res: Response) => {
    try {
      const shipment = await this.shipmentService.getShipmentByOrderId(req.params.orderId);
      ResponseUtil.success(res, shipment, 'Shipment retrieved successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to retrieve shipment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  getMyShipments = async (req: Request, res: Response) => {
    try {
      const customerId = (req as any).user?.userId;
      if (!customerId) {
        ResponseUtil.badRequest(res, 'Unauthorized');
        return;
      }
      const shipments = await this.shipmentService.getMyShipments(customerId);
      ResponseUtil.success(res, shipments, 'Shipments retrieved successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to retrieve shipments', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  getShipmentItems = async (req: Request, res: Response) => {
    try {
      const items = await this.shipmentService.getShipmentItems(req.params.id);
      ResponseUtil.success(res, items, 'Shipment items retrieved successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to retrieve shipment items', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // ─── Status transitions (admin only) ──────────────────────────────────────

  dispatchShipment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { courier_name, tracking_number, courier_order_id, awb_number, notes } = req.body;

      if (!courier_name || !tracking_number) {
        ResponseUtil.badRequest(res, 'courier_name and tracking_number are required to dispatch');
        return;
      }

      const result = await this.shipmentService.dispatchShipment(id, {
        courier_name,
        tracking_number,
        courier_order_id,
        awb_number,
        notes,
      });
      ResponseUtil.success(res, result, 'Shipment dispatched successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to dispatch shipment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  markInTransit = async (req: Request, res: Response) => {
    try {
      const result = await this.shipmentService.markInTransit(req.params.id, req.body.location);
      ResponseUtil.success(res, result, 'Shipment marked as in transit');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to update shipment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  markOutForDelivery = async (req: Request, res: Response) => {
    try {
      const result = await this.shipmentService.markOutForDelivery(req.params.id, req.body.location);
      ResponseUtil.success(res, result, 'Shipment marked as out for delivery');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to update shipment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  markDelivered = async (req: Request, res: Response) => {
    try {
      const result = await this.shipmentService.markDelivered(req.params.id, req.body.location);
      ResponseUtil.success(res, result, 'Shipment marked as delivered');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to update shipment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  markFailed = async (req: Request, res: Response) => {
    try {
      const result = await this.shipmentService.markFailed(req.params.id, req.body.reason);
      ResponseUtil.success(res, result, 'Shipment marked as failed');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to update shipment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  markReturned = async (req: Request, res: Response) => {
    try {
      const result = await this.shipmentService.markReturned(req.params.id, req.body.reason);
      ResponseUtil.success(res, result, 'Shipment marked as returned');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to update shipment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // ─── Item-level actions ────────────────────────────────────────────────────

  returnItem = async (req: Request, res: Response) => {
    try {
      const { id, itemId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        ResponseUtil.badRequest(res, 'Return reason is required');
        return;
      }

      const result = await this.shipmentService.returnItem(id, itemId, reason);
      ResponseUtil.success(res, result, 'Item marked as returned');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to return item', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  markItemDamaged = async (req: Request, res: Response) => {
    try {
      const { id, itemId } = req.params;
      const { notes } = req.body;

      if (!notes) {
        ResponseUtil.badRequest(res, 'Damage notes are required');
        return;
      }

      const result = await this.shipmentService.markItemDamaged(id, itemId, notes);
      ResponseUtil.success(res, result, 'Item marked as damaged');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to mark item as damaged', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // ─── Tracking ──────────────────────────────────────────────────────────────

  getTrackingHistory = async (req: Request, res: Response) => {
    try {
      const history = await this.shipmentService.getTrackingHistory(req.params.id);
      ResponseUtil.success(res, history, 'Tracking history retrieved successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to retrieve tracking history', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  addTrackingEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, message, location } = req.body;

      if (!status) {
        ResponseUtil.badRequest(res, 'status is required for a tracking event');
        return;
      }

      const result = await this.shipmentService.addTrackingEvent(id, { status, message, location });
      ResponseUtil.success(res, result, 'Tracking event added successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to add tracking event', error instanceof Error ? error.message : 'Unknown error');
    }
  };
}