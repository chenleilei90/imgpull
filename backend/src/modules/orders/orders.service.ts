import { Injectable } from "@nestjs/common";
import { mockOrders } from "../../common/mock-data";
import { todo } from "../../common/utils/mock-response";

@Injectable()
export class OrdersService {
  list() {
    return mockOrders;
  }

  get(id: string) {
    return mockOrders.find((order) => String(order.id) === id || order.orderNo === id) ?? mockOrders[0];
  }

  create() {
    return todo("TODO: create RechargeOrder. P0 only allows manual pay channel for normal order creation.");
  }

  close() {
    return todo("TODO: close pending RechargeOrder idempotently.");
  }

  manualRecharge() {
    return todo(
      "TODO: transaction writes recharge_orders, payment_records, point_transactions, point_account, admin_audit_logs, user_messages."
    );
  }

  paymentNotify(provider: "alipay" | "wechat") {
    return todo(`TODO: ${provider} notify contract reserved only. No SDK, QR code, signature verification, or payment settlement in P0.`);
  }
}
