import { Controller, Post } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { OrdersService } from "./orders.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly service: OrdersService) {}

  @Post("alipay/notify")
  alipayNotify() {
    return ok(this.service.paymentNotify("alipay"));
  }

  @Post("wechat/notify")
  wechatNotify() {
    return ok(this.service.paymentNotify("wechat"));
  }
}
