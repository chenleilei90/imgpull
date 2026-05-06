import { Injectable } from "@nestjs/common";
import { mockActivities } from "../../common/mock-data";
import { todo } from "../../common/utils/mock-response";

@Injectable()
export class ActivitiesService {
  list() {
    return mockActivities;
  }

  get(id: string) {
    return mockActivities.find((activity) => String(activity.id) === id) ?? mockActivities[0];
  }

  create() {
    return todo("TODO: create Activity config.");
  }

  update() {
    return todo("TODO: update Activity config.");
  }

  enable() {
    return todo("TODO: enable Activity.");
  }

  disable() {
    return todo("TODO: disable Activity.");
  }

  claim() {
    return todo("TODO: create ActivityClaim and PointTransaction in one transaction; prevent duplicate user claim.");
  }
}
