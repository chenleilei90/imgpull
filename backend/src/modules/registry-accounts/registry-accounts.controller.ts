import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { CreateRegistryAccountDto, UpdateRegistryAccountDto } from "./dto/registry-account.dto";
import { RegistryAccountsService } from "./registry-accounts.service";

@Controller("registries")
export class RegistryAccountsController {
  constructor(private readonly service: RegistryAccountsService) {}

  @Get()
  list() {
    return ok(this.service.list());
  }

  @Post()
  create(@Body() _dto: CreateRegistryAccountDto) {
    return ok(this.service.create());
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return ok(this.service.get(id));
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() _dto: UpdateRegistryAccountDto) {
    return ok({ id, result: this.service.update() });
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return ok({ id, result: this.service.remove() });
  }

  @Post(":id/test")
  test(@Param("id") id: string) {
    return ok({ id, result: this.service.testConnection() });
  }
}
