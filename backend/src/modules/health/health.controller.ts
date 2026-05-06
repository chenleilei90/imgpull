import { Controller, Get } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Get()
  async check() {
    return ok(await this.service.check());
  }
}
