import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { AdminAdjustPointsDto } from "../points/dto/points.dto";
import { AdminsService } from "./admins.service";

@Controller("admin/users")
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  async listUsers() {
    return ok(await this.adminsService.listUsers());
  }

  @Get(":id")
  async getUser(@Param("id") id: string) {
    return ok(await this.adminsService.getUser(id));
  }

  @Post(":id/points/adjust")
  adjustPoints(@Param("id") id: string, @Body() dto: AdminAdjustPointsDto) {
    return ok({ userId: id, dto, result: this.adminsService.adjustPoints() });
  }
}
