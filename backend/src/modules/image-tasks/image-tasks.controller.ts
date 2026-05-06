import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { CreateImageTaskDto, EstimateTaskDto, TaskActionDto } from "./dto/image-task.dto";
import { ImageTasksService } from "./image-tasks.service";

@Controller("tasks")
export class ImageTasksController {
  constructor(private readonly service: ImageTasksService) {}

  @Post("estimate")
  estimate(@Body() _dto: EstimateTaskDto) {
    return ok(this.service.estimate());
  }

  @Post()
  create(@Body() _dto: CreateImageTaskDto) {
    return ok(this.service.create());
  }

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
