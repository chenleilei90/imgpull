import { Controller, Get, Headers, Param } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  async me(@Headers("authorization") authorization: string | undefined) {
    return ok(await this.usersService.me(authorization));
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return ok(await this.usersService.getById(id));
  }
}
