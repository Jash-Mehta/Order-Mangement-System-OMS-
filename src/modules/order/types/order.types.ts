
export interface Order {
  id: string;        
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';