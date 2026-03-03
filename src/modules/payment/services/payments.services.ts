import { PaymentsRepsitories } from "../repositories/payments.repositories";
import { PaymentModel } from "../types/payment.types";
import { RazorpayWebhookEvent, WebhookEvents } from "../types/webhook.types";
import crypto from 'crypto';
import { VerifyPaymentDTO } from "../types/verify.paymentdto";
import { InventoryServices } from "../../inventory/services/inventory.services";
import Razorpay from "razorpay";

export class PaymentsServices {
  private readonly razorpay: Razorpay;

  constructor(
    private readonly paymentsRepositories: PaymentsRepsitories,
    private readonly reservationServices: InventoryServices,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  // ─── Create Payment ────────────────────────────────────────────────────────
  // Flow: check duplicate → reserve stock → create Razorpay order → save to DB → set order IN_PROGRESS

  async createPayment(input: PaymentModel) {
    const { order_id, user_id } = input;

    // Step 1: Guard against duplicate payment initiation
    const existing = await this.paymentsRepositories.getRazorpayByOrderId(order_id);
    if (existing) {
      return {
        message: 'Payment already initiated for this order. Please wait or contact support.',
      };
    }

    // Step 2: Create Razorpay order first — if this fails nothing is dirtied
    const razorpayOrder = await this.razorpay.orders.create({
      amount: input.amount,   // in paise
      currency: 'INR',
      receipt: order_id,
    });

    // Step 3: Deduct stock from inventory
    await this.reservationServices.createReservationsForOrder({ order_id, user_id });

    // Step 4: Save payment record to DB
    const payment = await this.paymentsRepositories.createPayment({
      order_id,
      user_id,
      razorpay_order_id: razorpayOrder.id,
      amount: input.amount,
      currency: 'INR',
      status: (input.status || 'CREATED') as any,
    });

    // Step 5: Mark order as IN_PROGRESS only after everything succeeded
    await this.paymentsRepositories.updateOrderStatusByOrderId(order_id, 'IN_PROGRESS');

    return payment;
  }

  // ─── Verify Payment ────────────────────────────────────────────────────────

  async verifyPayment(data: VerifyPaymentDTO) {
    const isValid = verifyRazorpaySignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature,
    );

    if (!isValid) {
      throw new Error('Invalid Razorpay signature');
    }

    // Persist the verified payment details
    const payment = await this.paymentsRepositories.getRazorpayByOrderId(data.razorpayOrderId);
    if (!payment) {
      throw new Error(`No payment record found for Razorpay order: ${data.razorpayOrderId}`);
    }

    // Update payment row with razorpay IDs and mark CAPTURED
    const updatedPayment = await this.paymentsRepositories.updatePaymentDetails(payment.order_id, {
      razorpay_payment_id: data.razorpayPaymentId,
      razorpay_signature: data.razorpaySignature,
      status: 'CAPTURED',
    });

    // Mark order and all its items as PAID
    await this.paymentsRepositories.updateOrderStatusByOrderId(payment.order_id, 'PAID');
    await this.paymentsRepositories.updateOrderItemStatusByOrderId(payment.order_id, 'PAID');

    return { success: true, payment: updatedPayment };
  }

  // ─── Webhook ───────────────────────────────────────────────────────────────

  verifyWebhookSignature(body: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }

  async processWebhook(event: RazorpayWebhookEvent): Promise<void> {
    const { event: eventType, payload } = event;

    switch (eventType) {
      case WebhookEvents.PAYMENT_AUTHORIZED:
        await this.handlePaymentAuthorized(payload.payment.entity);
        break;

      case WebhookEvents.PAYMENT_CAPTURED:
        await this.handlePaymentCaptured(payload.payment.entity);
        break;

      case WebhookEvents.PAYMENT_FAILED:
        await this.handlePaymentFailed(payload.payment.entity);
        // Also mark order and items FAILED
        await this.paymentsRepositories.updateOrderStatusByOrderId(payload.payment.entity.order_id, 'FAILED');
        await this.paymentsRepositories.updateOrderItemStatusByOrderId(payload.payment.entity.order_id, 'FAILED');
        break;

      case WebhookEvents.PAYMENT_REFUNDED:
        if (payload.refund) {
          await this.handlePaymentRefunded(payload.refund.entity);
          // FIX: use payment entity's order_id (refund entity has payment_id, not order_id)
          await this.paymentsRepositories.updateOrderStatusByOrderId(payload.payment.entity.order_id, 'REFUNDED');
          await this.paymentsRepositories.updateOrderItemStatusByOrderId(payload.payment.entity.order_id, 'REFUNDED');
        }
        break;

      case WebhookEvents.ORDER_PAID:
        if (payload.order) {
          // FIX: was using payload.payment.entity.order_id which doesn't exist on ORDER_PAID;
          //      the correct field is payload.order.entity.id
          await this.handleOrderPaid(payload.order.entity);
          await this.paymentsRepositories.updateOrderStatusByOrderId(payload.order.entity.id, 'PAID');
          await this.paymentsRepositories.updateOrderItemStatusByOrderId(payload.order.entity.id, 'PAID');
        }
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }
  }

  // ─── Webhook helpers ───────────────────────────────────────────────────────

  private async handlePaymentAuthorized(paymentEntity: any): Promise<void> {
    await this.paymentsRepositories.updatePaymentStatus(paymentEntity.order_id, 'AUTHORIZED');
  }

  private async handlePaymentCaptured(paymentEntity: any): Promise<void> {
    await this.paymentsRepositories.updatePaymentStatus(paymentEntity.order_id, 'CAPTURED');
  }

  private async handlePaymentFailed(paymentEntity: any): Promise<void> {
    await this.paymentsRepositories.updatePaymentStatus(paymentEntity.order_id, 'FAILED');
  }

  private async handlePaymentRefunded(refundEntity: any): Promise<void> {
    await this.paymentsRepositories.updatePaymentStatusByPaymentId(refundEntity.payment_id, 'REFUNDED');
  }

  private async handleOrderPaid(orderEntity: any): Promise<void> {
    // Update payment table using the Razorpay order ID
    await this.paymentsRepositories.updatePaymentStatus(orderEntity.id, 'CAPTURED');
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  async getPaymentByOrderId(order_id: string) {
    return await this.paymentsRepositories.getRazorpayByOrderId(order_id);
  }

  async getPaymentByRazorpayId(razorpay_payment_id: string) {
    return await this.paymentsRepositories.getPaymentByRazorpayId(razorpay_payment_id);
  }

  async getUserPayments(user_id: string) {
    return await this.paymentsRepositories.getUserPayments(user_id);
  }

  async getPaymentRefunds(payment_id: string) {
    return await this.paymentsRepositories.getPaymentRefunds(payment_id);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}