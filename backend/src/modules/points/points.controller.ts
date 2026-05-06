import { Controller, Get } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { PointsService } from "./points.service";

@Controller("points")
export class PointsController {
  constructor(private readonly service: PointsService) {}

  @Get("account")
  account() {
    return ok(this.service.account());
  }

  @Get("transactions")
  transactions() {
    return ok(this.service.transactions());
  }
}
