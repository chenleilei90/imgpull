import { Controller, Get, Param, Post, Put } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { AnnouncementsService } from "./announcements.service";

@Controller("admin/announcements")
export class AdminAnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Get()
  list() {
    return ok(this.service.list());
  }

  @Post()
  create() {
    return ok(this.service.create());
  }

  @Put(":id")
  update(@Param("id") id: string) {
    return ok({ id, result: this.service.update() });
  }
}
