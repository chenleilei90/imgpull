export type PayChannel = "manual" | "alipay" | "wechat";
export type OrderStatus = "pending" | "paid" | "closed" | "reserved";

export interface RechargeOrder {
  id: string;
  user: string;
  item: string;
  amountCents: number;
  points: number;
  channel: PayChannel;
  status: OrderStatus;
  note: string;
  createdAt: string;
}
