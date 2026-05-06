import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { UpdateSystemConfigDto } from "./dto/system-config.dto";
import { SystemConfigService } from "./system-config.service";

@Controller("admin/system-configs")
export class SystemConfigController {
  constructor(private readonly service: SystemConfigService) {}

  @Get()
  async list() {
    return ok(await this.service.list());
  }

  @Get(":key")
  async get(@Param("key") key: string) {
    return ok(await this.service.get(key));
  }

  @Put(":key")
  async update(@Param("key") key: string, @Body() dto: UpdateSystemConfigDto) {
    return ok(await this.service.update(key, dto));
  }
}
