import { Controller, Get } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { AuditLogsService } from "./audit-logs.service";

@Controller("admin/audit-logs")
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  list() {
    return ok(this.service.list());
  }
}
