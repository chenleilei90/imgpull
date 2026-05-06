import { Module } from "@nestjs/common";
import { AdminAccountsController } from "./admin-accounts.controller";
import { AdminsController } from "./admins.controller";
import { AdminsService } from "./admins.service";

@Module({
  controllers: [AdminsController, AdminAccountsController],
  providers: [AdminsService]
})
export class AdminsModule {}
