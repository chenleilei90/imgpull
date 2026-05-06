import { Module } from "@nestjs/common";
import { AdminHelpController } from "./admin-help.controller";
import { HelpController } from "./help.controller";
import { HelpService } from "./help.service";

@Module({
  controllers: [HelpController, AdminHelpController],
  providers: [HelpService]
})
export class HelpModule {}
