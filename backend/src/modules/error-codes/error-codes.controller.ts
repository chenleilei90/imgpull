import { Controller, Get, Param } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { ErrorCodesService } from "./error-codes.service";

@Controller("error-codes")
export class ErrorCodesController {
  constructor(private readonly service: ErrorCodesService) {}

  @Get(":code")
  get(@Param("code") code: string) {
    return ok(this.service.get(code));
  }
}
