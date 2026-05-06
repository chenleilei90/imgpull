import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { CreateOrderDto } from "./dto/orders.dto";
import { OrdersService } from "./orders.service";

@Controller()
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get("recharge-packages")
  rechargePackages() {
    return ok([
      { id: 1, name: "积分包 100", priceCents: 1000, points: 100 },
      { id: 2, name: "积分包 500", priceCents: 3900, points: 500 }
    ]);
  }

  @Post("orders")
  create(@Body() _dto: CreateOrderDto) {
    return ok(this.service.create());
  }

  @Get("orders")
  list() {
    return ok(this.service.list());
  }

  @Get("orders/:id")
  get(@Param("id") id: string) {
    return ok(this.service.get(id));
  }
}
