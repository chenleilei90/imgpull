import { Module } from "@nestjs/common";
import { AdminWorkersController } from "./admin-workers.controller";
import { WorkerProtocolController } from "./worker-protocol.controller";
import { WorkersService } from "./workers.service";

@Module({
  controllers: [AdminWorkersController, WorkerProtocolController],
  providers: [WorkersService]
})
export class WorkersModule {}
