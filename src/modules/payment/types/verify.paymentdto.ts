export interface VerifyPaymentDTO {
  orderId: string;

  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
