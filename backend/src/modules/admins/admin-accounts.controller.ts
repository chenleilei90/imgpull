import { Controller, Get, Param } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { AdminsService } from "./admins.service";

@Controller("admin/admins")
export class AdminAccountsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  async listAdmins() {
    return ok(await this.adminsService.listAdmins());
  }

  @Get(":id")
  async getAdmin(@Param("id") id: string) {
    return ok(await this.adminsService.getAdmin(id));
  }
}
