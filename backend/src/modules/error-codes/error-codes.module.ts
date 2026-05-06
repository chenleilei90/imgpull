import { Module } from "@nestjs/common";
import { AdminErrorCodesController } from "./admin-error-codes.controller";
import { ErrorCodesController } from "./error-codes.controller";
import { ErrorCodesService } from "./error-codes.service";

@Module({
  controllers: [ErrorCodesController, AdminErrorCodesController],
  providers: [ErrorCodesService]
})
export class ErrorCodesModule {}
