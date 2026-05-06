import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { AdminOrdersController } from "./admin-orders.controller";
import { PaymentsController } from "./payments.controller";
import { OrdersService } from "./orders.service";

@Module({
  controllers: [OrdersController, AdminOrdersController, PaymentsController],
  providers: [OrdersService]
})
export class OrdersModule {}
