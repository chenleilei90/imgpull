import { Controller, Get, Param, Post, Put } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { HelpService } from "./help.service";

@Controller("admin/docs")
export class AdminHelpController {
  constructor(private readonly service: HelpService) {}

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
