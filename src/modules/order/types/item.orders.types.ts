export interface ItemOrdersType{
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    rarting?: number,
    review?: string,
    amount:number,
    reviewed_at?: Date,
    expires_at: Date;
    created_at: Date;
}