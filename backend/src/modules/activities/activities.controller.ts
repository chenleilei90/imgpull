import { Controller, Get, Param, Post } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { ActivitiesService } from "./activities.service";

@Controller("activities")
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @Get()
  list() {
    return ok(this.service.list());
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return ok(this.service.get(id));
  }

  @Post(":id/claim")
  claim(@Param("id") id: string) {
    return ok({ id, result: this.service.claim() });
  }
}
