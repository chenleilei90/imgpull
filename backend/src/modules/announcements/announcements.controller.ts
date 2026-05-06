import { Controller, Get, Param } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { AnnouncementsService } from "./announcements.service";

@Controller("announcements")
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Get()
  list() {
    return ok(this.service.list());
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return ok(this.service.get(id));
  }
}
