import { Module } from "@nestjs/common";
import { PointsController } from "./points.controller";
import { AdminPointsController } from "./admin-points.controller";
import { PointsService } from "./points.service";

@Module({
  controllers: [PointsController, AdminPointsController],
  providers: [PointsService]
})
export class PointsModule {}
