import { Module } from "@nestjs/common";
import { ActivitiesController } from "./activities.controller";
import { AdminActivitiesController } from "./admin-activities.controller";
import { ActivitiesService } from "./activities.service";

@Module({
  controllers: [ActivitiesController, AdminActivitiesController],
  providers: [ActivitiesService]
})
export class ActivitiesModule {}
