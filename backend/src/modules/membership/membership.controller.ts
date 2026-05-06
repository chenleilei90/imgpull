import { Controller, Get } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { MembershipService } from "./membership.service";

@Controller("membership-plans")
export class MembershipController {
  constructor(private readonly service: MembershipService) {}

  @Get()
  list() {
    return ok(this.service.listPlans());
  }
}
