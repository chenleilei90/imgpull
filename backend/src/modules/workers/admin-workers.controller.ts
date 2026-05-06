import { Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { WorkersService } from "./workers.service";

@Controller("admin/workers")
export class AdminWorkersController {
  constructor(private readonly service: WorkersService) {}

  @Get()
  list() {
    return ok(this.service.list());
  }

  @Post()
  create() {
    return ok(this.service.mutateLifecycle("create"));
  }

  @Put(":id")
  update(@Param("id") id: string) {
    return ok({ id, result: this.service.mutateLifecycle("update") });
  }

  @Post(":id/enable")
  enable(@Param("id") id: string) {
    return ok({ id, result: this.service.mutateLifecycle("enable") });
  }

  @Post(":id/disable")
  disable(@Param("id") id: string) {
    return ok({ id, result: this.service.mutateLifecycle("disable") });
  }

  @Post(":id/maintenance")
  maintenance(@Param("id") id: string) {
    return ok({ id, result: this.service.mutateLifecycle("maintenance") });
  }

  @Post(":id/drain")
  drain(@Param("id") id: string) {
    return ok({ id, result: this.service.mutateLifecycle("drain") });
  }

  @Post(":id/retire")
  retire(@Param("id") id: string) {
    return ok({ id, result: this.service.mutateLifecycle("retire") });
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return ok({ id, result: this.service.mutateLifecycle("soft-delete") });
  }
}
