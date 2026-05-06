import { Injectable } from "@nestjs/common";
import { mockWorkers } from "../../common/mock-data";
import { todo } from "../../common/utils/mock-response";

@Injectable()
export class WorkersService {
  list() {
    return mockWorkers;
  }

  mutateLifecycle(action: string) {
    return todo(`TODO: Worker lifecycle action ${action}; no real scheduler is connected.`);
  }

  heartbeat() {
    return todo("TODO: verify X-Worker-Token hash, update WorkerHeartbeat, assist lease tracking.");
  }

  claim() {
    return todo("TODO: claim queued task and return X-Claim-Token header in real implementation.");
  }

  leaseAction(action: string) {
    return todo(`TODO: ${action} requires X-Worker-Token and X-Claim-Token headers; no body/query claimToken accepted.`);
  }

  credentialsResolve() {
    return todo("TODO: credentials resolve is a mock skeleton. It never returns real registry credentials in this scaffold.");
  }
}
