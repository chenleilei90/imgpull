import { Controller, Get, Param } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { HelpService } from "./help.service";

@Controller("help/articles")
export class HelpController {
  constructor(private readonly service: HelpService) {}

  @Get()
  list() {
    return ok(this.service.list());
  }

  @Get(":slug")
  get(@Param("slug") slug: string) {
    return ok(this.service.get(slug));
  }
}
