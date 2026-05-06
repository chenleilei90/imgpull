import { Controller, Get, Param, Put } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { ErrorCodesService } from "./error-codes.service";

@Controller("admin/error-codes")
export class AdminErrorCodesController {
  constructor(private readonly service: ErrorCodesService) {}

  @Get()
  list() {
    return ok(this.service.list());
  }

  @Put(":code")
  update(@Param("code") code: string) {
    return ok({ code, result: this.service.update() });
  }
}
