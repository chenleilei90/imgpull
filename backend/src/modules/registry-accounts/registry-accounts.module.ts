import { Module } from "@nestjs/common";
import { RegistryAccountsController } from "./registry-accounts.controller";
import { RegistryAccountsService } from "./registry-accounts.service";

@Module({
  controllers: [RegistryAccountsController],
  providers: [RegistryAccountsService]
})
export class RegistryAccountsModule {}
