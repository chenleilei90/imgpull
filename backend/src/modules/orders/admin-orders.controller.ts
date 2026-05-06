import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { ManualRechargeDto } from "./dto/orders.dto";
import { OrdersService } from "./orders.service";

@Controller("admin")
export class AdminOrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get("orders")
  list() {
    return ok(this.service.list());
  }

  @Get("orders/:id")
  get(@Param("id") id: string) {
    return ok(this.service.get(id));
  }

  @Post("orders/:id/close")
  close(@Param("id") id: string) {
    return ok({ id, result: this.service.close() });
  }

  @Post("manual-recharges")
  manualRecharge(@Body() _dto: ManualRechargeDto) {
    return ok(this.service.manualRecharge());
  }
}
