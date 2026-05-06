import { Body, Controller, Headers, Param, Post } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { ClaimTaskDto, WorkerHeartbeatDto, WorkerLogDto, WorkerResultDto, WorkerStageDto } from "./dto/worker.dto";
import { WorkersService } from "./workers.service";

@Controller("worker")
export class WorkerProtocolController {
  constructor(private readonly service: WorkersService) {}

  @Post("heartbeat")
  heartbeat(@Headers("x-worker-token") workerToken: string | undefined, @Body() _dto: WorkerHeartbeatDto) {
    return ok({ workerTokenReceived: Boolean(workerToken), result: this.service.heartbeat() });
  }

  @Post("tasks/claim")
  claim(@Headers("x-worker-token") workerToken: string | undefined, @Body() _dto: ClaimTaskDto) {
    return ok({ workerTokenReceived: Boolean(workerToken), result: this.service.claim() });
  }

  @Post("tasks/:id/lease/renew")
  renewLease(@Param("id") id: string, @Headers("x-worker-token") workerToken: string | undefined, @Headers("x-claim-token") claimToken: string | undefined) {
    return ok({ id, workerTokenReceived: Boolean(workerToken), claimTokenReceived: Boolean(claimToken), result: this.service.leaseAction("lease renew") });
  }

  @Post("tasks/:id/control")
  control(@Param("id") id: string, @Headers("x-worker-token") workerToken: string | undefined, @Headers("x-claim-token") claimToken: string | undefined) {
    return ok({ id, workerTokenReceived: Boolean(workerToken), claimTokenReceived: Boolean(claimToken), result: this.service.leaseAction("control polling") });
  }

  @Post("tasks/:id/credentials/resolve")
  credentialsResolve(@Param("id") id: string, @Headers("x-worker-token") workerToken: string | undefined, @Headers("x-claim-token") claimToken: string | undefined) {
    return ok({ id, workerTokenReceived: Boolean(workerToken), claimTokenReceived: Boolean(claimToken), result: this.service.credentialsResolve() });
  }

  @Post("tasks/:id/stage")
  stage(
    @Param("id") id: string,
    @Headers("x-worker-token") workerToken: string | undefined,
    @Headers("x-claim-token") claimToken: string | undefined,
    @Body() dto: WorkerStageDto,
  ) {
    return ok({
      id,
      workerTokenReceived: Boolean(workerToken),
      claimTokenReceived: Boolean(claimToken),
      dto,
      result: this.service.leaseAction("stage report"),
    });
  }

  @Post("tasks/:id/logs")
  logs(
    @Param("id") id: string,
    @Headers("x-worker-token") workerToken: string | undefined,
    @Headers("x-claim-token") claimToken: string | undefined,
    @Body() dto: WorkerLogDto,
  ) {
    return ok({
      id,
      workerTokenReceived: Boolean(workerToken),
      claimTokenReceived: Boolean(claimToken),
      dto,
      result: this.service.leaseAction("log report"),
    });
  }

  @Post("tasks/:id/complete")
  complete(
    @Param("id") id: string,
    @Headers("x-worker-token") workerToken: string | undefined,
    @Headers("x-claim-token") claimToken: string | undefined,
    @Body() dto: WorkerResultDto,
  ) {
    return ok({
      id,
      workerTokenReceived: Boolean(workerToken),
      claimTokenReceived: Boolean(claimToken),
      dto,
      result: this.service.leaseAction("complete"),
    });
  }

  @Post("tasks/:id/fail")
  fail(
    @Param("id") id: string,
    @Headers("x-worker-token") workerToken: string | undefined,
    @Headers("x-claim-token") claimToken: string | undefined,
    @Body() dto: WorkerResultDto,
  ) {
    return ok({
      id,
      workerTokenReceived: Boolean(workerToken),
      claimTokenReceived: Boolean(claimToken),
      dto,
      result: this.service.leaseAction("fail"),
    });
  }

  @Post("tasks/:id/cancel-ack")
  cancelAck(
    @Param("id") id: string,
    @Headers("x-worker-token") workerToken: string | undefined,
    @Headers("x-claim-token") claimToken: string | undefined,
    @Body() dto: WorkerResultDto,
  ) {
    return ok({
      id,
      workerTokenReceived: Boolean(workerToken),
      claimTokenReceived: Boolean(claimToken),
      dto,
      result: this.service.leaseAction("cancel ack"),
    });
  }

  @Post("tasks/:id/cleanup-done")
  cleanupDone(
    @Param("id") id: string,
    @Headers("x-worker-token") workerToken: string | undefined,
    @Headers("x-claim-token") claimToken: string | undefined,
    @Body() dto: WorkerResultDto,
  ) {
    return ok({
      id,
      workerTokenReceived: Boolean(workerToken),
      claimTokenReceived: Boolean(claimToken),
      dto,
      result: this.service.leaseAction("cleanup done"),
    });
  }
}
