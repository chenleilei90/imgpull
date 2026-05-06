import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { CreateActivityDto, UpdateActivityDto } from "./dto/activity.dto";
import { ActivitiesService } from "./activities.service";

@Controller("admin/activities")
export class AdminActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @Get()
  list() {
    return ok(this.service.list());
  }

  @Post()
  create(@Body() _dto: CreateActivityDto) {
    return ok(this.service.create());
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() _dto: UpdateActivityDto) {
    return ok({ id, result: this.service.update() });
  }

  @Post(":id/enable")
  enable(@Param("id") id: string) {
    return ok({ id, result: this.service.enable() });
  }

  @Post(":id/disable")
  disable(@Param("id") id: string) {
    return ok({ id, result: this.service.disable() });
  }
}
