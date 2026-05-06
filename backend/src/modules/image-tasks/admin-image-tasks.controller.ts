import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { TaskActionDto } from "./dto/image-task.dto";
import { ImageTasksService } from "./image-tasks.service";

@Controller("admin/tasks")
export class AdminImageTasksController {
  constructor(private readonly service: ImageTasksService) {}

  @Get()
  list() {
    return ok(this.service.list());
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return ok(this.service.get(id));
  }

  @Get(":id/logs")
  logs(@Param("id") id: string) {
    return ok(this.service.logs(id));
  }

  @Post(":id/cancel")
  cancel(@Param("id") id: string, @Body() _dto: TaskActionDto) {
    return ok({ id, result: this.service.cancel() });
  }

  @Post(":id/retry")
  retry(@Param("id") id: string, @Body() _dto: TaskActionDto) {
    return ok({ id, result: this.service.retry() });
  }
}
