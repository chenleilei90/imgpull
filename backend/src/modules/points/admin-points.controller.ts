import { Controller, Get } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { PointsService } from "./points.service";

@Controller("admin/points")
export class AdminPointsController {
  constructor(private readonly service: PointsService) {}

  @Get("transactions")
  transactions() {
    return ok(this.service.transactions());
  }
}
