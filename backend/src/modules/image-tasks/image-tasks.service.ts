import { Injectable } from "@nestjs/common";
import { mockImageTasks } from "../../common/mock-data";
import { todo } from "../../common/utils/mock-response";

@Injectable()
export class ImageTasksService {
  list() {
    return mockImageTasks;
  }

  get(id: string) {
    return mockImageTasks.find((task) => String(task.id) === id || task.taskNo === id) ?? mockImageTasks[0];
  }

  estimate() {
    return {
      estimatedPoints: 8,
      estimatedSizeBytes: 5368709120,
      billingPolicy: "P0 caps successful settlement by frozen points."
    };
  }

  create() {
    return todo("TODO: idempotently create ImageTask and freeze PointAccount + PointTransaction in one transaction.");
  }

  logs(id: string) {
    return {
      taskId: id,
      logs: [
        "Attempt #1 source inspect mock log",
        "Attempt #1 stage update mock log",
        "No real registry copy is executed in this scaffold."
      ]
    };
  }

  cancel() {
    return todo("TODO: state-machine-only cancel request; no real Worker execution.");
  }

  retry() {
    return todo("TODO: create next ImageTaskAttempt skeleton; no real Worker execution.");
  }
}
