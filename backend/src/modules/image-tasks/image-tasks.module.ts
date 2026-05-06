import { Module } from "@nestjs/common";
import { ImageTasksController } from "./image-tasks.controller";
import { AdminImageTasksController } from "./admin-image-tasks.controller";
import { ImageTasksService } from "./image-tasks.service";

@Module({
  controllers: [ImageTasksController, AdminImageTasksController],
  providers: [ImageTasksService]
})
export class ImageTasksModule {}
