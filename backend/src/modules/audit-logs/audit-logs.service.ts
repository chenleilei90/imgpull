import { Injectable } from "@nestjs/common";
import { mockAuditLogs } from "../../common/mock-data";

@Injectable()
export class AuditLogsService {
  list() {
    return mockAuditLogs;
  }
}
